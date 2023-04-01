import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/solid";
import {
  Link,
  ThrownResponse,
  useActionData,
  useCatch,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  ActionArgs,
  json,
  LoaderArgs,
  redirect,
  SerializeFrom,
} from "@remix-run/server-runtime";
import { PropsWithChildren, useCallback } from "react";
import Button from "~/components/kits/Button";
import Form from "~/components/kits/FormKit";
import { KeyedFlash, TKeyedFlash } from "~/components/kits/KeyedFlash";
import Panel, { PanelBody } from "~/components/kits/Panel";
import { useCooldown } from "~/hooks/useCooldown";
import {
  createRecoveryCodes,
  deleteRecoveryCodes,
  listRecoveryCodes,
} from "~/models/recoveryCodes.server";
import {
  generateRecoveryCodes,
  requireUser,
  requireUserSession,
} from "~/services/auth.server";

type RecoveryLoaderError = { kind: "error" };
type RecoveryLoaderData =
  | { kind: "existing" }
  | { kind: "new"; recoveryCodes: string[] }
  | RecoveryLoaderError;

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  /**
   * If recovery codes already exist then we want to give the user a chance to
   * generate new ones. This will delete the old ones and is necessary since
   * we are hashing the recovery codes. Hashed string cannot be unhashed for
   * display again so it is a one time shot.
   */
  const existingRecoveryCodes = await listRecoveryCodes({ userId: user.id });
  if (existingRecoveryCodes?.length)
    return json<RecoveryLoaderData>({ kind: "existing" });

  /**
   * We are going to generate new recovery codes and save them to the database
   * if they do not have any recovery codes yet.
   */
  try {
    const recoveryCodes = generateRecoveryCodes(user.email);
    await createRecoveryCodes({ recoveryCodes, userId: user.id });
    return json<RecoveryLoaderData>({ kind: "new", recoveryCodes });
  } catch (error) {
    if (error instanceof Response) throw error;
    // Log to your exception tracker of choice
    console.log(error);
    throw error;
  }
}

export async function action({ request }: ActionArgs) {
  const { userId } = await requireUserSession(request);

  /**
   * We only need to delete our recovery codes because on completion of the
   * action Remix will rerun the loader data and that will generate the
   * new recovery codes that we need.
   */
  try {
    await deleteRecoveryCodes(userId);
    return redirect("/multi-factor/totp/recovery");
  } catch (error) {
    if (error instanceof Response) throw error;
    // Log to your exception tracker of choice
    console.log(error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete your recovery codes.";
    return json<TKeyedFlash>({
      key: "global",
      flash: {
        message,
        kind: "error",
      },
    });
  }
}

function Body({ data }: { data: SerializeFrom<typeof loader> }) {
  const [isCopied, startCooldown] = useCooldown();
  const navigation = useNavigation();

  const copyCodes = useCallback(() => {
    if (data.kind === "new") {
      window?.navigator?.clipboard?.writeText(data.recoveryCodes.join("\n"));
      startCooldown();
    }
  }, [data]);

  switch (data.kind) {
    case "error":
      return <Link to=".">Retry</Link>;

    case "existing":
      return (
        <Form
          method="delete"
          className="flex items-center justify-center border-t-[3px] border-indigo-900 bg-indigo-50 p-8"
        >
          <Button variant="indigoAlt">
            {navigation.state === "idle"
              ? "Reset Recovery Codes"
              : "Resetting Codes..."}
          </Button>
        </Form>
      );

    case "new":
      return (
        <div className="group relative">
          <ul className="grid grid-cols-2 gap-2 border-t-[3px] border-indigo-900 bg-indigo-50 p-5">
            {data.recoveryCodes.map((code) => (
              <li>{code}</li>
            ))}
          </ul>

          <div className="absolute left-0 right-0 bottom-0 top-0.5 hidden items-center justify-center bg-indigo-50/25 backdrop-blur group-hover:flex">
            <Button type="button" variant="indigoAlt" onClick={copyCodes}>
              {isCopied ? (
                <>
                  <CheckIcon className="h-4 w-4 text-indigo-500" />
                  Copied
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="h-4 w-4 text-indigo-500" />
                  Copy Recovery Codes
                </>
              )}
            </Button>
          </div>
        </div>
      );
  }
}

function Base({ children }: PropsWithChildren<{}>) {
  const actionData = useActionData<typeof action>();

  return (
    <main className="relative flex min-h-screen items-center justify-center gap-4 bg-indigo-100">
      <div className="flex max-w-md flex-col gap-4">
        <KeyedFlash flashKey="global" flash={actionData} />
        <Panel
          className="flex-1"
          color="bg-indigo-200 border-indigo-900 text-indigo-900"
        >
          <PanelBody className="overflow-hidden bg-white">
            <div className="p-5">
              <h1 className="text-xl font-bold">Save recovery codes</h1>
              <p className="text-sm">
                Scan this QRCode with the app you installed in the previous
                step. Once you have it added use the code from the app to
                confirm your two factor setup below.
              </p>
            </div>
            {children}
          </PanelBody>
        </Panel>
        <Button to="/multi-factor/totp/setup" variant="indigo">
          Next: Setup Authenticator
        </Button>
      </div>
    </main>
  );
}

export default function MultiFactorTOTPRecovery() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <Base>
      <Body data={loaderData} />
    </Base>
  );
}

export function CatchBoundary() {
  const caught = useCatch<ThrownResponse<number, RecoveryLoaderError>>();
  return (
    <Base>
      <Body data={caught.data} />
    </Base>
  );
}
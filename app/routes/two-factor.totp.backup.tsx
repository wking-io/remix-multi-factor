import {
  Link,
  ThrownResponse,
  useActionData,
  useCatch,
  useLoaderData,
} from "@remix-run/react";
import {
  ActionArgs,
  json,
  LoaderArgs,
  redirect,
  SerializeFrom,
} from "@remix-run/server-runtime";
import { PropsWithChildren } from "react";
import Button from "~/components/kits/Button";
import Form from "~/components/kits/FormKit";
import { KeyedFlash, TKeyedFlash } from "~/components/kits/KeyedFlash";
import Panel, { PanelBody } from "~/components/kits/Panel";
import {
  createBackupCodes,
  deleteBackupCodes,
  listBackupCodes,
} from "~/models/backupCodes.server";
import {
  generateBackupCodes,
  requireUser,
  requireUserId,
} from "~/services/auth.server";

type BackupLoaderError = { kind: "error" };
type BackupLoaderData =
  | { kind: "existing" }
  | { kind: "new"; backupCodes: string[] }
  | BackupLoaderError;

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  /**
   * If backup codes already exist then we want to give the user a chance to
   * generate new ones. This will delete the old ones and is necessary since
   * we are hashing the backup codes. Hashed string cannot be unhashed for
   * display again so it is a one time shot.
   */
  const existingBackupCodes = await listBackupCodes({ userId: user.id });
  if (existingBackupCodes?.length)
    return json<BackupLoaderData>({ kind: "existing" });

  /**
   * We are going to generate new backup codes and save them to the database
   * if they do not have any backup codes yet.
   */
  try {
    const backupCodes = generateBackupCodes(user.email);
    await createBackupCodes({ backupCodes, userId: user.id });
    return json<BackupLoaderData>({ kind: "new", backupCodes });
  } catch (error) {
    if (error instanceof Response) throw error;
    // Log to your exception tracker of choice
    console.log(error);
    throw error;
  }
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  /**
   * We only need to delete our backup codes because on completion of the
   * action Remix will rerun the loader data and that will generate the
   * new backup codes that we need.
   */
  try {
    await deleteBackupCodes(userId);
    return redirect("/two-factor/totp/backup");
  } catch (error) {
    if (error instanceof Response) throw error;
    // Log to your exception tracker of choice
    console.log(error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete your backup codes.";
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
  switch (data.kind) {
    case "error":
      return <Link to=".">Retry</Link>;

    case "existing":
      return (
        <Form
          method="delete"
          className="flex items-center justify-center border-t-[3px] border-indigo-900 bg-indigo-50 p-8"
        >
          <Button variant="indigoAlt">Reset Backup Codes</Button>
        </Form>
      );

    case "new":
      return (
        <ul className="grid grid-cols-2 gap-2 border-t-[3px] border-indigo-900 bg-indigo-50 p-5">
          {data.backupCodes.map((code) => (
            <li>{code}</li>
          ))}
        </ul>
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
              <h1 className="text-xl font-bold">Save backup codes</h1>
              <p className="text-sm">
                Scan this QRCode with the app you installed in the previous
                step. Once you have it added use the code from the app to
                confirm your two factor setup below.
              </p>
            </div>
            {children}
          </PanelBody>
        </Panel>
        <Button to="/settings" variant="indigo">
          Complete Setup
        </Button>
      </div>
    </main>
  );
}

export default function TwoFactorTOTPBackup() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <Base>
      <Body data={loaderData} />
    </Base>
  );
}

export function CatchBoundary() {
  const caught = useCatch<ThrownResponse<number, BackupLoaderError>>();
  return (
    <Base>
      <Body data={caught.data} />
    </Base>
  );
}

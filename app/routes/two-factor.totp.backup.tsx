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
import { Text } from "~/components/kits/Text";
import Container from "~/components/layout/Container";
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
        <Form method="delete">
          <Button>Reset Backup Codes</Button>
        </Form>
      );

    case "new":
      return (
        <ul>
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
    <div className="bg-gradient-to-br from-brand-dark via-brand to-brand-light">
      <Container className="flex min-h-screen flex-col items-center justify-center gap-2">
        <KeyedFlash flashKey="global" flash={actionData} />
        <div className="max-w-sm rounded-xl bg-layer-1 p-4 shadow-lg transition focus-within:shadow-xl">
          <Text variant="cardHeading">Set up two-factor authentication</Text>
          <p className="text-sm">
            Scan this QRCode with the app you installed as part of the previous
            step.
          </p>
          {children}
          <div className="mt-6 flex items-center justify-center bg-base p-4"></div>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-2">
          <Button to="/two-factor/totp/confirm" className="w-full">
            Next: Confirm
          </Button>
          <Form action="/two-factor/totp" method="delete" className="w-full">
            <Button variant="ghost" className="w-full">
              Cancel
            </Button>
          </Form>
        </div>
      </Container>
    </div>
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

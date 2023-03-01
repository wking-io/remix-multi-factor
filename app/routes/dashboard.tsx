import { LoaderArgs } from "@remix-run/server-runtime";
import Button from "~/components/kits/Button";
import { requireUserId } from "~/services/auth.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  return null;
}

export default function Index() {
  return (
    <main className="relative flex min-h-screen items-center justify-center gap-4 bg-white">
      <Button to="/settings" prefetch="intent">
        Settings
      </Button>
    </main>
  );
}

import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { LoaderArgs } from "@remix-run/server-runtime";
import { AuthIllo, ProfileIllo, TimeZoneIllo } from "~/components/illos";
import Button from "~/components/kits/Button";
import { Input, Label } from "~/components/kits/FormKit";
import Panel, { PanelBody } from "~/components/kits/Panel";
import Container from "~/components/layout/Container";
import { requireUserId } from "~/services/auth.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  return null;
}

export default function Index() {
  return (
    <main className="relative flex min-h-screen items-center justify-center gap-4 bg-pink-100">
      <Container className="flex gap-6">
        <div className="flex flex-col gap-6">
          <Panel
            className="flex-1"
            color="bg-indigo-200 border-indigo-900 text-indigo-900"
          >
            <PanelBody className="overflow-hidden bg-white">
              <div className="flex gap-6">
                <div className="h-72 w-72">
                  <ProfileIllo
                    className="h-full w-auto"
                    accent="fill-indigo-400"
                  />
                </div>
                <div className="w-full py-5 px-8">
                  <h2 className="text-2xl font-bold">Profile Settings</h2>
                  <div className="mt-4 flex gap-4">
                    <div className="flex flex-1 flex-col gap-1">
                      <Label>First Name</Label>
                      <Input
                        name="firstName"
                        type="text"
                        colors="border-indigo-900 bg-indigo-200 text-indigo-900"
                        defaultValue="Squilliam"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <Label>Last Name</Label>
                      <Input
                        name="lastName"
                        type="text"
                        colors="border-indigo-900 bg-indigo-200 text-indigo-900"
                        defaultValue="King"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-1">
                    <Label>Email Address</Label>
                    <Input
                      name="email"
                      type="email"
                      colors="border-indigo-900 bg-indigo-200 text-indigo-900"
                      defaultValue="remix@is.cool"
                    />
                  </div>
                </div>
              </div>
            </PanelBody>
          </Panel>
          <Panel
            className="flex-1"
            color="bg-teal-200 border-teal-900 text-teal-900"
          >
            <PanelBody className="overflow-hidden bg-white">
              <div className="flex gap-6">
                <div className="flex h-24 w-24 items-center justify-center border-r-[3px] border-teal-900">
                  <TimeZoneIllo
                    className="h-14 w-auto"
                    land="fill-teal-500"
                    sea="fill-sky-200"
                  />
                </div>
                <div className="flex flex-1 items-center gap-6 pr-8">
                  <p className="text-lg font-bold">Choose your timezone:</p>
                  <div className="relative flex-1">
                    <Input
                      name="timeZone"
                      type="text"
                      colors="border-teal-900 bg-teal-200 text-teal-900"
                      defaultValue="America/Chicago (-03:00)"
                    />
                    <ChevronDownIcon className="absolute top-1/2 right-5 h-5 w-5 -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </PanelBody>
          </Panel>
        </div>
        <Panel color="bg-orange-200 border-orange-900 text-orange-900">
          <PanelBody className="flex h-full flex-col overflow-hidden bg-white">
            <div className="bg-orange-200 p-8">
              <AuthIllo className="h-auto w-48" />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5">
              <Button
                to="/two-factor/totp/download"
                variant="red"
                prefetch="intent"
              >
                Enable Two-Factor
              </Button>
              <Button variant="orange" to="/">
                Reset Password
              </Button>
            </div>
          </PanelBody>
        </Panel>
      </Container>
    </main>
  );
}

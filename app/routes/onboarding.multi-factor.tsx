import { AuthIllo } from "~/components/illos";
import Button from "~/components/kits/Button";
import Panel, { PanelBody } from "~/components/kits/Panel";

export default function OnboardingMultiFactor() {
  return (
    <main className="relative flex min-h-screen items-center justify-center gap-4 bg-blue-100">
      <div className="flex max-w-md flex-col gap-4">
        <Panel
          className="flex-1"
          color="bg-blue-200 border-blue-900 text-blue-900"
        >
          <PanelBody className="overflow-hidden bg-white">
            <div className="flex items-center justify-center bg-blue-100 px-5 py-8">
              <AuthIllo className="h-56 w-auto" />
            </div>
            <div className="p-5">
              <h1 className="text-xl font-bold">
                Enable Multi-Factor Authentication
              </h1>
              <p className="mt-3">
                I mean...at this point you should be doing this with every
                account that offers it.
              </p>
            </div>
          </PanelBody>
        </Panel>
        <Button to="/multi-factor/totp/download" variant="blue">
          Enable Multi-Factor
        </Button>
        <Button to="/dashboard" variant="blueAlt">
          Skip
        </Button>
      </div>
    </main>
  );
}

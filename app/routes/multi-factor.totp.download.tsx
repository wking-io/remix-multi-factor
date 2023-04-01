import { AndriodIcon, ChromeIcon, IOSIcon } from "~/components/icons";
import { DownloadIllo } from "~/components/illos";
import Button from "~/components/kits/Button";
import Panel, { PanelBody } from "~/components/kits/Panel";

const apps = [
  {
    name: "Authy by Twillio",
    links: [
      {
        description: "iOS app",
        icon: IOSIcon,
        href: "https://itunes.apple.com/us/app/authy/id494168017",
      },
      {
        description: "Andriod App",
        icon: AndriodIcon,
        href: "https://play.google.com/store/apps/details?id=com.authy.authy",
      },
      {
        description: "Chrome app",
        icon: ChromeIcon,
        href: "https://chrome.google.com/webstore/detail/authy/gaedmjdfmmahhbjefcbgaolhhanlaolb?hl=en",
      },
    ],
  },
  {
    name: "Google Authenticator",
    links: [
      {
        description: "iOS app",
        icon: IOSIcon,
        href: "https://apps.apple.com/app/google-authenticator/id388497605",
      },
      {
        description: "Andriod App",
        icon: AndriodIcon,
        href: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2",
      },
    ],
  },
  {
    name: "Authenticator",
    links: [
      {
        description: "iOS app",
        icon: IOSIcon,
        href: "https://itunes.apple.com/us/app/authenticator/id766157276",
      },
    ],
  },
];

export default function MultiFactorTOTPDownload() {
  return (
    <main className="relative flex min-h-screen items-center justify-center gap-4 bg-pink-100">
      <div className="flex max-w-md flex-col gap-4">
        <Panel
          className="flex-1"
          color="bg-pink-200 border-pink-900 text-pink-900"
        >
          <PanelBody className="overflow-hidden bg-white">
            <div className="flex items-center justify-center bg-pink-100 px-5">
              <DownloadIllo className="h-56 w-auto" />
            </div>
            <div className="p-5">
              <h1 className="text-xl font-bold">Download Authenticator App</h1>
              <p className="mt-3">
                To use this multi-factor method it requires you to download a
                3rd party authenticator app on a secondary device. If you do not
                already have one that you use you can find links for two great
                ones below:
              </p>
              <div className="mt-6 flex flex-col gap-4">
                {apps.map(({ name, links }) => (
                  <div key={name} className="flex justify-between">
                    <p className="font-medium uppercase">{name}</p>
                    <div className="flex items-center gap-2">
                      {links.map(({ icon: Icon, href, description }) => (
                        <a
                          key={href}
                          href={href}
                          className="h-4 w-auto hover:text-pink-600"
                        >
                          <span className="sr-only">{description}</span>
                          <Icon className="h-full w-auto" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PanelBody>
        </Panel>
        <Button to="/multi-factor/totp/recovery" variant="pink">
          Next: Recovery Codes
        </Button>
        <Button to="/settings" variant="pinkAlt">
          Cancel
        </Button>
      </div>
    </main>
  );
}

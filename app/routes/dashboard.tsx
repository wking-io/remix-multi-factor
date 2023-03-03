import { LoaderArgs } from "@remix-run/server-runtime";
import {
  BellIcon,
  CloudIcon,
  RegionIcon,
  SettingIcon,
} from "~/components/icons";
import Panel, { PanelBody, PanelLink } from "~/components/kits/Panel";
import Container from "~/components/layout/Container";
import { requireUserId } from "~/services/auth.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  return null;
}

export default function Index() {
  return (
    <main className="relative flex min-h-screen items-center justify-center gap-4 bg-pink-100">
      <Container className="grid gap-6">
        <div className="flex w-full gap-6">
          <Panel className="flex-1">
            <PanelBody className="flex items-center gap-16 bg-white py-5 px-8">
              <h2 className="font-display text-2xl font-bold">
                [PRODUCTION] Softserve
              </h2>
              <ul className="flex flex-1 items-center gap-6">
                <li className="flex items-center gap-2">
                  <CloudIcon className="h-5 w-auto text-emerald-500" />
                  <p className="font-medium">aws</p>
                </li>
                <li className="flex items-center gap-2">
                  <RegionIcon className="h-5 w-auto text-emerald-500" />
                  <p className="font-medium">us-west-3</p>
                </li>
              </ul>
              <p role="status" className="flex items-center gap-2 font-medium">
                <span>ready</span>
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                </span>
              </p>
            </PanelBody>
          </Panel>
          <PanelLink
            to="/settings"
            color="bg-slate-200 border-slate-900 text-slate-900 hover:bg-slate-300"
          >
            <PanelBody className="flex h-full w-[72px] items-center justify-center bg-white">
              <span className="sr-only">View Settings</span>
              <SettingIcon className="h-auto w-12" />
            </PanelBody>
          </PanelLink>
        </div>
        <div className="flex gap-6">
          <Panel color="bg-violet-200 border-violet-900 text-violet-900 flex-1">
            <PanelBody>
              <div className="py-5 px-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">IOPS</h3>
                  <div className="flex items-center gap-6">
                    <p className="flex items-center gap-2">
                      <span>write</span>
                      <span className="h-3 w-3 rounded-full bg-violet-500" />
                    </p>
                    <p className="flex items-center gap-2">
                      <span>read</span>
                      <span className="h-3 w-3 rounded-full bg-pink-500" />
                    </p>
                  </div>
                </div>
              </div>
            </PanelBody>
          </Panel>
          <div className="grid w-full max-w-sm gap-6">
            <PanelLink
              to="/dashboard"
              color="bg-blue-800 border-blue-900 hover:bg-blue-900"
            >
              <PanelBody className="flex h-[72px] items-center gap-3 bg-blue-600 px-8 font-bold">
                <BellIcon className="h-auto w-10" />
                <p className="flex-1 text-xl text-white">Cluster Messages</p>
                <p className="rounded-lg bg-blue-700 py-1 px-2 text-xl text-white">
                  21
                </p>
              </PanelBody>
            </PanelLink>
          </div>
        </div>
      </Container>
    </main>
  );
}

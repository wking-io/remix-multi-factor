import type { LoaderArgs } from "@remix-run/server-runtime";
import {
  BellIcon,
  ChevronIcon,
  CloudIcon,
  RegionIcon,
  SettingIcon,
} from "~/components/icons";
import { ChartIllo } from "~/components/illos";
import Button from "~/components/kits/Button";
import Panel, { PanelBody, PanelLink } from "~/components/kits/Panel";
import Container from "~/components/layout/Container";
import { requireUserSession } from "~/services/auth.server";
import { isEven } from "~/utils/misc";

const replicas = ["Softserve East", "Softserve Europe", "Softserve Asia"];
const cacheRates = [
  {
    name: "accounts",
    cacheRatio: "92%",
    indexRatio: "81%",
    rowCount: 234,
    size: "18MB",
  },
  {
    name: "account_billing",
    cacheRatio: "99%",
    indexRatio: "90%",
    rowCount: 234,
    size: "11MB",
  },
  {
    name: "account_users",
    cacheRatio: "96%",
    indexRatio: "72%",
    rowCount: 678,
    size: "31MB",
  },
  {
    name: "users",
    cacheRatio: "98%",
    indexRatio: "60%",
    rowCount: 582,
    size: "22MB",
  },
];

export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request);
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
          <Panel
            className="flex-1"
            color="bg-violet-200 border-violet-900 text-violet-900"
          >
            <PanelBody className="overflow-hidden bg-violet-50">
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
                <ChartIllo className="mt-4 h-auto w-full" />
              </div>
              <div className="bg-white">
                <div className="border-y-[3px] border-purple-900 py-3 px-8">
                  <h3 className="text-xl font-bold">Cache & Index Rates</h3>
                </div>
                <table className="w-full">
                  <thead className="bg-violet-200">
                    <th className="py-2 pl-8 pr-4 text-left text-sm uppercase">
                      Table Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm uppercase">
                      Size
                    </th>
                    <th className="px-4 py-2 text-right text-sm uppercase">
                      Row Count
                    </th>
                    <th className="px-4 py-2 text-right text-sm uppercase">
                      Cache Hit Ratio
                    </th>
                    <th className="px-4 py-2 text-right text-sm uppercase">
                      Index Hit Ratio
                    </th>
                  </thead>
                  <tbody>
                    {cacheRates.map(
                      ({ name, cacheRatio, indexRatio, rowCount, size }, i) => (
                        <tr
                          key={name}
                          className={isEven(i) ? "bg-violet-50" : "bg-white"}
                        >
                          <td className="py-2 pl-8 pr-4 text-left font-medium">
                            {name}
                          </td>
                          <td className="px-4 py-2 text-left text-violet-900/70">
                            {size}
                          </td>
                          <td className="px-4 py-2 text-right text-violet-900/70">
                            {rowCount}
                          </td>
                          <td className="px-4 py-2 text-right text-violet-900/70">
                            {cacheRatio}
                          </td>
                          <td className="py-2 pl-4 pr-8 text-right text-violet-900/70">
                            {indexRatio}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </PanelBody>
          </Panel>
          <div className="flex w-full max-w-sm flex-col gap-6">
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
            <Panel>
              <PanelBody>
                <div className="flex items-baseline justify-between border-b-[3px] border-emerald-900 py-5 px-8">
                  <h3 className="text-xl font-bold">Database Storage</h3>
                  <p className="font-medium">500GB</p>
                </div>
                <div className="p-8">
                  <div className="relative h-6 w-full rounded-full border-[3px] border-emerald-900">
                    <div className="absolute top-0 left-0 bottom-0 w-5/6 rounded-full bg-lime-500" />
                    <div className="absolute top-0 left-0 bottom-0 w-1/3 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </PanelBody>
            </Panel>
            <Panel color="bg-orange-200 border-orange-900 text-orange-900 flex-1">
              <PanelBody className="flex h-full flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b-[3px] border-orange-900 bg-white py-1 pl-8 pr-1">
                  <h3 className="text-xl font-bold">Replicas</h3>
                  <Button to="/" color="orange">
                    Create Replica
                  </Button>
                </div>
                <div className="flex flex-1 flex-col">
                  {replicas.map((replica, i) => (
                    <div
                      key={replica}
                      className={`flex flex-1 items-center justify-between py-3 px-8 ${
                        isEven(i) ? "bg-orange-50" : "bg-white"
                      }`}
                    >
                      {replica}
                      <ChevronIcon className="h-auto w-3" />
                    </div>
                  ))}
                </div>
              </PanelBody>
            </Panel>
          </div>
        </div>
      </Container>
    </main>
  );
}

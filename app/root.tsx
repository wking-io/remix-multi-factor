import type { LinksFunction, LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "@remix-run/react";
import { createAuthenticityToken } from "remix-utils";
import { getSession, sessionStorage } from "~/services/session.server";
import { getEnv } from "~/utils/env";
import { invariant } from "~/utils/invariant";
import { getDomainUrl } from "~/utils/misc.server";
import stylesheetUrl from "./styles/app.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesheetUrl }, { rel: "stylesheet", href: "https://rsms.me/inter/inter.css" }];
};

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);
  const token = createAuthenticityToken(session, "_csrf");
  return json(
    {
      csrf: token,
      ENV: getEnv(),
      requestInfo: {
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
      },
    },
    { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } }
  );
}

export type RootLoaderData = SerializeFrom<typeof loader>;

export function useRootLoaderData() {
  const data = useRouteLoaderData("root");
  invariant(data, "Unable to find root data");
  return data as RootLoaderData;
}

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

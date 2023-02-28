import { Outlet } from "@remix-run/react";

export async function loader() {}

export default function TOTPLayout() {
  return <Outlet />;
}

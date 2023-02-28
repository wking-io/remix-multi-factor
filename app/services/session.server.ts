import { createCookieSessionStorage } from "@remix-run/node";
import { getEnvOrThrow } from "~/utils/env";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 60,
    secrets: [getEnvOrThrow("SESSION_SECRET")],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

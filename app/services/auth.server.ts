import { init } from "@paralleldrive/cuid2";
import { createCookie, redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { z } from "zod";
import {
  getUserById,
  User,
  VerifyLogin,
  verifyLogin,
} from "~/models/user.server";
import { getSession, sessionStore } from "~/services/session.server";
import { UserSession } from "~/types";
import { getEnvOrThrow } from "~/utils/env";

const USER_SESSION_KEY = "userId";

// Create an instance of the authenticator.
// Pass the object type we are storing.
export let authenticator = new Authenticator<UserSession>(sessionStore, {
  sessionKey: USER_SESSION_KEY,
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const data = VerifyLogin.parse(Object.fromEntries(form));
    let verification = await verifyLogin(data);
    return sessionFromVerification(verification);
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass"
);

export function sessionFromVerification({
  userId,
  multiFactorEnabled,
}: Awaited<ReturnType<typeof verifyLogin>>): UserSession {
  return { kind: multiFactorEnabled ? "multiFactor" : "basic", userId };
}

export async function setUserSession(request: Request, data: UserSession) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, data);
  return session;
}

/**
 * Helpers
 */
export async function requireUserSession(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userSession = await authenticator.isAuthenticated(request, {
    failureRedirect: `/sign-in?redirectTo=${redirectTo}`,
  });

  if (userSession.kind === "basic" || userSession.expires) {
    return userSession;
  }

  const multiFactorUrl = `/auth/totp`;

  // Validate that the current request is not to the multiFactor url to avoid a redirect loop
  if (redirectTo === multiFactorUrl) {
    return userSession;
  }

  throw redirect(`${multiFactorUrl}?redirectTo=${redirectTo}`);
}

export async function requireUser(
  request: Request
): Promise<User & Omit<UserSession, "userId">> {
  const { userId, ...rest } = await requireUserSession(request);
  try {
    const user = await getUserById(userId);
    return { ...user, ...rest };
  } catch (e) {
    throw redirect("/sign-in");
  }
}

export async function maybeUser(request: Request): Promise<User | null> {
  const userSession = await authenticator.isAuthenticated(request);

  if (!userSession) return null;
  const { userId, ...rest } = userSession;
  try {
    const user = await getUserById(userId);
    return { ...user, ...rest };
  } catch (e) {
    throw redirect("/sign-in");
  }
}

/**
 * 2FA TOTP
 */
export const tempTOTP = createCookie("tempTOTP", {
  httpOnly: true,
  maxAge: 60 * 60 * 10, // 10 min
  path: "/",
  sameSite: "strict",
  secrets: [getEnvOrThrow("SESSION_SECRET")],
  secure: process.env.NODE_ENV === "production",
});

export const TempTOTPValidator = z.object({ secret: z.string() });

// The init function returns a custom createId function with the specified
// configuration.
export function generateRecoveryCodes(email: string): string[] {
  /**
   * Initialiaze the cuid maker with the user email for a even
   * better randomized output with less chance of collision.
   */
  const createId = init({
    length: 12,
    fingerprint: email,
  });

  /**
   * Make 10 of them.
   */
  return [
    createId(),
    createId(),
    createId(),
    createId(),
    createId(),
    createId(),
    createId(),
    createId(),
    createId(),
    createId(),
  ];
}

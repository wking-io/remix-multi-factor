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
import { getSession, sessionStorage } from "~/services/session.server";
import { UserSession } from "~/types";
import { getEnvOrThrow } from "~/utils/env";

const USER_SESSION_KEY = "userId";

// Create an instance of the authenticator.
// Pass the object type we are storing.
export let authenticator = new Authenticator<UserSession>(sessionStorage, {
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
}: {
  userId: string;
}): UserSession {
  return { kind: "basic", userId };
}

export async function setUserSession(request: Request, data: UserSession) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, data);
  return session;
}

/**
 * Helpers
 */
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userSession = await authenticator.isAuthenticated(request, {
    failureRedirect: `/sign-in?${redirectTo}`,
  });

  if (userSession.kind === "basic" || userSession.authenticated) {
    return userSession.userId;
  }

  const twoFactorUrl = `/auth/${userSession.kind}`;

  // Validate that the current request is not to the twoFactor url to avoid a redirect loop
  if (redirectTo === twoFactorUrl) {
    return userSession.userId;
  }

  throw redirect(twoFactorUrl);
}

export async function requireUser(request: Request): Promise<User> {
  const userId = await requireUserId(request);
  try {
    return await getUserById(userId);
  } catch (e) {
    throw redirect("/sign-in");
  }
}

export async function maybeUser(request: Request): Promise<User | null> {
  const userSession = await authenticator.isAuthenticated(request);

  if (!userSession) return null;
  try {
    return await getUserById(userSession?.userId);
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
export function generateBackupCodes(email: string): string[] {
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

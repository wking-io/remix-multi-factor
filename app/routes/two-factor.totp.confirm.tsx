import type { ActionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { ThrownResponse, useActionData, useCatch } from "@remix-run/react";
import { authenticator as twoFA } from "otplib";
import Button from "~/components/kits/Button";
import Form, { Input, Label } from "~/components/kits/FormKit";
import { KeyedFlash, TKeyedFlash } from "~/components/kits/KeyedFlash";
import { Text } from "~/components/kits/Text";
import Container from "~/components/layout/Container";
import { saveTOTP } from "~/models/user.server";
import {
  requireUserId,
  setUserSession,
  tempTOTP,
  TempTOTPValidator,
} from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
import { invariant } from "~/utils/invariant";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.clone().formData();

  /**
   * First we need to check if the user actually submitted a token
   */
  const token = formData.get("token");
  if (typeof token !== "string") {
    // return error
    return json<TKeyedFlash>({
      key: "global",
      flash: {
        kind: "error",
        message: "A verification code is required.",
      },
    });
  }

  /**
   * Get the secret from the session so that we can validate the user
   * entered token from their OTP app. Return error if it doesn't exist.
   * The error is required unlike on the setup route because if we
   * generated a new secret now it would never match the user submission.
   */
  const existingTOTP = TempTOTPValidator.safeParse(
    await tempTOTP.parse(request.headers.get("Cookie"))
  );

  if (!existingTOTP.success) {
    // return error
    return json({
      message:
        "There was an issue getting your temporary secret. Please reload and try again.",
    });
  }

  const { secret } = existingTOTP.data;

  try {
    invariant(
      twoFA.check(token, secret),
      "Your code was invalid. Please try again."
    );

    await saveTOTP({ userId, secret });
    // Add flash message for success and redirect to url where 2FA is managed

    const headers = new Headers();
    headers.append("Set-Cookie", await tempTOTP.serialize({ token: null }));

    const session = await setUserSession(request, {
      kind: "totp",
      authenticated: true,
      userId: userId,
    });
    headers.append("Set-Cookie", await sessionStorage.commitSession(session));

    return redirect("/settings", {
      headers,
    });
  } catch (e) {
    // Because redirects work by throwing a Response, you need to check if the
    // caught error is a response and return it or throw it again
    if (e instanceof Response) return e;
    if (e instanceof Error) {
      throw json({ message: e.message });
    }

    throw json<TKeyedFlash>({
      key: "global",
      flash: { kind: "error", message: "Unknown server error." },
    });
  }
}

function Base({ flash }: { flash?: TKeyedFlash }) {
  return (
    <div className="bg-gradient-to-br from-brand-dark via-brand to-brand-light">
      <Container className="flex min-h-screen items-center justify-center">
        <KeyedFlash flashKey="global" flash={flash} />
        <div className="max-w-sm rounded-xl bg-layer-1 p-4 shadow-lg transition focus-within:shadow-xl">
          <Text variant="cardHeading">Confirm two-factor authentication</Text>
          <Form className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                name="token"
                id="token"
                aria-invalid={flash?.key === "input" ? true : undefined}
                aria-describedby="token-error"
              />
              <KeyedFlash id="token-error" flashKey="input" flash={flash} />
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Verify
              </Button>

              <Button
                formAction="/two-factor/totp"
                formMethod="delete"
                variant="ghost"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}

export default function TwoFactorTOTPSetup() {
  const actionData = useActionData<typeof action>();
  return <Base flash={actionData} />;
}

export function CatchBoundary() {
  const caught = useCatch<ThrownResponse<number, TKeyedFlash>>();
  return <Base flash={caught.data} />;
}

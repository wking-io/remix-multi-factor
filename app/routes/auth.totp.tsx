import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { ThrownResponse, useActionData, useCatch } from "@remix-run/react";
import { authenticator as twoFA } from "otplib";
import Button from "~/components/kits/Button";
import Form, { FieldError, Input, Label } from "~/components/kits/FormKit";
import { Text } from "~/components/kits/Text";
import Container from "~/components/layout/Container";
import { getTOTP } from "~/models/user.server";
import { requireUserId, setUserSession } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
import { invariant } from "~/utils/invariant";
import { safeRedirect } from "~/utils/misc.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  return null;
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.clone().formData();
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/dashboard");

  const token = formData.get("token");
  if (typeof token !== "string") {
    // return error
    return json(
      {
        message: "A verification code is required.",
      },
      { status: 404 }
    );
  }

  const secret = await getTOTP(userId);

  if (!secret) {
    // return error
    return json({
      message:
        "There was an issue getting your temporary secret. Please reload and try again.",
    });
  }

  try {
    invariant(
      twoFA.check(token, secret.secret),
      "Your code was invalid. Please try again."
    );

    const session = await setUserSession(request, {
      kind: "totp",
      authenticated: true,
      userId,
    });

    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      throw json({ message: e.message });
    }

    throw json({ message: "Unknown server error." });
  }
}

function OnboardingTwoFactorPage({ error }: { error?: string }) {
  return (
    <div className="bg-gradient-to-br from-brand-dark via-brand to-brand-light">
      <Container className="flex min-h-screen items-center justify-center">
        <div className="max-w-sm rounded-xl bg-layer-1 p-4 shadow-lg transition focus-within:shadow-xl">
          <Text variant="cardHeading">
            Validate with two-factor authentication
          </Text>
          <p className="text-sm">
            Your account has enabled two-factor authentication. Please enter
            code below to finish signing in.
          </p>
          <Form className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                name="token"
                id="token"
                aria-invalid={error ? true : undefined}
                aria-describedby="token-error"
              />
              <FieldError
                name="token-error"
                errors={error ? { _errors: [error] } : undefined}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Verify
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}

export default function OnboardingTwoFactor() {
  const actionData = useActionData<typeof action>();
  return <OnboardingTwoFactorPage error={actionData?.message} />;
}

export function ErrorBoundary() {}

export function CatchBoundary() {
  const caught = useCatch<ThrownResponse<number, { message: string }>>();
  return <OnboardingTwoFactorPage error={caught.data?.message} />;
}

import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import addMinutes from "date-fns/addMinutes";
import { authenticator as totp } from "otplib";
import Button from "~/components/kits/Button";
import Form, { Input, Label } from "~/components/kits/FormKit";
import { KeyedFlash, TKeyedFlash } from "~/components/kits/KeyedFlash";
import { Text } from "~/components/kits/Text";
import Container from "~/components/layout/Container";
import { getTOTP } from "~/models/user.server";
import { requireUserSession, setUserSession } from "~/services/auth.server";
import { sessionStore } from "~/services/session.server";
import { invariant } from "~/utils/invariant";
import { safeRedirect } from "~/utils/misc.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request);
  return null;
}

export async function action({ request }: ActionArgs) {
  const { userId } = await requireUserSession(request);
  const formData = await request.clone().formData();
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/dashboard");

  const token = formData.get("token");
  if (typeof token !== "string") {
    // return error
    return json<TKeyedFlash>({
      key: "token",
      flash: {
        kind: "error",
        message: "A verification code is required.",
      },
    });
  }

  const userTOTP = await getTOTP(userId);

  if (!userTOTP) {
    // return error
    return json<TKeyedFlash>({
      key: "token",
      flash: {
        kind: "error",
        message: "There was an issue getting your TOTP data.",
      },
    });
  }

  try {
    invariant(
      totp.check(token, userTOTP.secret),
      "Your code was invalid. Please try again."
    );

    const session = await setUserSession(request, {
      kind: "multiFactor",
      expires: addMinutes(new Date(), 5),
      userId,
    });

    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await sessionStore.commitSession(session),
      },
    });
  } catch (e) {
    // Log to your error service
    console.log(e);

    return json<TKeyedFlash>({
      key: "global",
      flash: {
        message: e instanceof Error ? e.message : "Unknown server error.",
        kind: "error",
      },
    });
  }
}

export default function AuthenticateTOTPPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="bg-gradient-to-br from-brand-dark via-brand to-brand-light">
      <Container className="flex min-h-screen items-center justify-center">
        <div className="max-w-sm rounded-xl bg-layer-1 p-4 shadow-lg transition focus-within:shadow-xl">
          <Text variant="cardHeading">
            Validate with multi-factor authentication
          </Text>
          <p className="text-sm">
            Your account has enabled multi-factor authentication. Please enter
            code below to finish signing in.
          </p>
          <Form className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                name="token"
                id="token"
                aria-invalid={actionData ? true : undefined}
                aria-describedby="token-error"
              />
              <KeyedFlash
                id="token-error"
                flashKey="token"
                flash={actionData}
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

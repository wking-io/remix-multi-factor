import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { useActionData, useNavigation } from "@remix-run/react";
import addMinutes from "date-fns/addMinutes";
import { authenticator as totp } from "otplib";
import Button from "~/components/kits/Button";
import Form, { TOTPCodeInput } from "~/components/kits/FormKit";
import type { TKeyedFlash } from "~/components/kits/KeyedFlash";
import { KeyedFlash } from "~/components/kits/KeyedFlash";
import Panel, { PanelBody } from "~/components/kits/Panel";
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
  const navigation = useNavigation();

  return (
    <main className="relative flex min-h-screen items-center justify-center gap-4 bg-lime-100">
      <Form className="flex max-w-md flex-col gap-4" method="post">
        <KeyedFlash flashKey="global" flash={actionData} />
        <Panel
          className="flex-1"
          color="bg-lime-200 border-lime-900 text-lime-900"
        >
          <PanelBody className="overflow-hidden bg-white">
            <div className="p-5">
              <h1 className="text-xl font-bold">
                Verify your Multi-Factor Code
              </h1>
              <p className="text-sm">
                Using your Authenticator app enter the verification code into
                the field below.
              </p>
            </div>
            <div className="flex flex-col gap-3 p-5">
              <TOTPCodeInput
                colors="border-lime-900 bg-lime-200 text-lime-900"
                inputClassName="placeholder:text-lime-600/40"
              />
              <KeyedFlash flashKey="token" flash={actionData} />
            </div>
          </PanelBody>
        </Panel>
        <Button type="submit" variant="lime">
          {navigation.state === "idle"
            ? "Authenticate Code"
            : "Authenticating..."}
        </Button>
        <Button to="/support" variant="limeAlt">
          Contact Support
        </Button>
      </Form>
    </main>
  );
}

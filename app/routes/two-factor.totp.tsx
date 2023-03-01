import { Outlet } from "@remix-run/react";
import { json, LoaderArgs, redirect } from "@remix-run/server-runtime";
import { authenticator as twoFA } from "otplib";
import {
  requireUser,
  tempTOTP,
  TempTOTPValidator,
} from "~/services/auth.server";

export async function loader({ request }: LoaderArgs) {
  await requireUser(request);

  /**
   * If secret exists in the cookie already just return. We do not want to
   * create a new cookie and restart the timeout or break the confirmation
   * step by changing the secret after they have already setup their app.
   **/
  const existingTOTP = TempTOTPValidator.safeParse(
    await tempTOTP.parse(request.headers.get("Cookie"))
  );
  if (existingTOTP.success) {
    return json(null);
  }

  /**
   * Setup the cookie with a generated secret we will use to create the qrcode
   * and validate app setup.
   */
  const secret = twoFA.generateSecret();
  return json(null, {
    headers: {
      "Set-Cookie": await tempTOTP.serialize({
        secret,
      }),
    },
  });
}

export async function action() {
  /**
   * Cancel button action on every step. This will clear the temp cookie set and redirect back to the settings page.
   */
  return redirect("/settings", {
    headers: {
      "Set-Cookie": await tempTOTP.serialize(
        {
          secret: null,
        },
        { maxAge: -1 }
      ),
    },
  });
}

export default function TOTPLayout() {
  return <Outlet />;
}

import { useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { authenticator as twoFA } from "otplib";
import QR from "qrcode";
import Button from "~/components/kits/Button";
import Form from "~/components/kits/FormKit";
import { Text } from "~/components/kits/Text";
import Container from "~/components/layout/Container";
import {
  requireUser,
  tempTOTP,
  TempTOTPValidator,
} from "~/services/auth.server";
import { getEnvOrThrow } from "~/utils/env";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  const existingTOTP = TempTOTPValidator.safeParse(
    await tempTOTP.parse(request.headers.get("Cookie"))
  );

  if (!existingTOTP.success) {
    /**
     * This is where you would log this to your error tracking service to
     * indicate there was an error. We are going to generate a new secret if
     * we enter this branch because we want to make sure the user experience
     * is not broken with a server error when we can easily generate a new
     * secret and save the cookie.
     */
    const secret = twoFA.generateSecret();
    const otpauth = twoFA.keyuri(user.email, getEnvOrThrow("APP_NAME"), secret);
    const qrcode = await QR.toDataURL(otpauth);

    return json(
      { qrcode, secret },
      {
        headers: {
          "Set-Cookie": await tempTOTP.serialize({
            secret,
          }),
        },
      }
    );
  }

  const { secret } = existingTOTP.data;
  const otpauth = twoFA.keyuri(user.email, getEnvOrThrow("APP_NAME"), secret);
  const qrcode = await QR.toDataURL(otpauth);

  return json({ qrcode, secret });
}

export default function TwoFactorTOTPSetup() {
  const { qrcode, secret } = useLoaderData<typeof loader>();

  return (
    <div className="bg-gradient-to-br from-brand-dark via-brand to-brand-light">
      <Container className="flex min-h-screen flex-col items-center justify-center gap-2">
        <div className="max-w-sm rounded-xl bg-layer-1 p-4 shadow-lg transition focus-within:shadow-xl">
          <Text variant="cardHeading">Set up two-factor authentication</Text>
          <p className="text-sm">
            Scan this QRCode with the app you installed as part of the previous
            step.
          </p>
          <div className="mt-6 flex items-center justify-center bg-base p-4">
            <img
              src={qrcode}
              alt="Authenticator QRCode"
              className="h-auto w-32 bg-layer-1"
            />
          </div>
          <p>
            Having trouble with QRCode? Use this to manually setup: {secret}
          </p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-2">
          <Button to="/two-factor/totp/backup" className="w-full">
            Next: Backup
          </Button>
          <Form action="/two-factor/totp" method="delete" className="w-full">
            <Button variant="ghost" className="w-full">
              Cancel
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
}

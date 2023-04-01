import { Popover, Transition } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import {
  ActionArgs,
  json,
  LoaderArgs,
  redirect,
} from "@remix-run/server-runtime";
import addMinutes from "date-fns/addMinutes";
import { authenticator as totp } from "otplib";
import QR from "qrcode";
import {
  ChangeEvent,
  Fragment,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "~/components/kits/Button";
import Form, { Input } from "~/components/kits/FormKit";
import { KeyedFlash, TKeyedFlash } from "~/components/kits/KeyedFlash";
import Panel, { PanelBody } from "~/components/kits/Panel";
import { saveTOTP } from "~/models/user.server";
import {
  requireUser,
  requireUserSession,
  setUserSession,
  tempTOTP,
  TempTOTPValidator,
} from "~/services/auth.server";
import { sessionStore } from "~/services/session.server";
import { getEnvOrThrow } from "~/utils/env";
import { invariant } from "~/utils/invariant";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  /**
   * If secret exists in the cookie already just return. We do not want to
   * create a new cookie and restart the timeout or break confirmation
   * by changing the secret after they have already setup their app.
   **/
  const existingTOTP = TempTOTPValidator.safeParse(
    await tempTOTP.parse(request.headers.get("Cookie"))
  );

  /**
   * Setup the cookie with a generated secret we will use to create the qrcode
   * and validate app setup.
   */
  if (!existingTOTP.success) {
    /**
     * This is where you would log this to your error tracking service to
     * indicate there was an error. We are going to generate a new secret if
     * we enter this branch because we want to make sure the user experience
     * is not broken with a server error when we can easily generate a new
     * secret and save the cookie.
     */
    const secret = totp.generateSecret();
    const otpauth = totp.keyuri(user.email, getEnvOrThrow("APP_NAME"), secret);
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
  const otpauth = totp.keyuri(user.email, getEnvOrThrow("APP_NAME"), secret);
  const qrcode = await QR.toDataURL(otpauth);

  return json({ qrcode, secret });
}

export async function action({ request }: ActionArgs) {
  const { userId } = await requireUserSession(request);
  const formData = await request.clone().formData();

  if (formData.get("cancel")) {
    /**
     * Cancel button on this step will clear the temp cookie set and redirect back to the settings page.
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
  } else {
    /**
     * First we need to check if the user actually submitted a token
     */
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

    /**
     * Get the secret from the session so that we can validate the user
     * entered token from their OTP app. Return error if it doesn't exist.
     */
    const existingTOTP = TempTOTPValidator.safeParse(
      await tempTOTP.parse(request.headers.get("Cookie"))
    );

    if (!existingTOTP.success) {
      // return error
      return json<TKeyedFlash>({
        key: "token",
        flash: {
          kind: "error",
          message:
            "There was an issue getting your temporary secret. Please reload and try again.",
        },
      });
    }

    const { secret } = existingTOTP.data;

    try {
      /**
       * Check the submitted token against the generated secret
       */
      invariant(
        totp.check(token, secret),
        "Your code was invalid. Please try again."
      );

      /**
       * Save the secret to the database
       */
      await saveTOTP({ userId, secret });

      /**
       * We need to update both the temp secret cookie and the current user
       * session. So, we need to use the Headers interface to submit multiple
       * headers with the same key.
       */
      const headers = new Headers();

      /**
       * Nullify temp secret cookie
       **/
      headers.append(
        "Set-Cookie",
        await tempTOTP.serialize(
          {
            secret: null,
          },
          { maxAge: -1 }
        )
      );

      /**
       * Updatre the current user session to be a multi-factor session.
       * This includes an expiration for when an action that requires
       * a two factor challenge should be revalidated. Also, the default
       * method to revalidate with.
       */
      const session = await setUserSession(request, {
        kind: "multiFactor",
        expires: addMinutes(new Date(), 5),
        userId: userId,
      });

      headers.append("Set-Cookie", await sessionStore.commitSession(session));

      return redirect("/settings", {
        headers,
      });
    } catch (e) {
      /**
       * Because redirects work by throwing a Response, you need to check if the
       * caught error is a response and return it or throw it again
       **/
      if (e instanceof Response) return e;
      if (e instanceof Error) {
        return json<TKeyedFlash>({
          key: "token",
          flash: { kind: "error", message: e.message },
        });
      }

      return json<TKeyedFlash>({
        key: "global",
        flash: { kind: "error", message: "Unknown server error." },
      });
    }
  }
}

function ConfirmationCodeInput() {
  const [value, setValue] = useState<string>("");
  const [refs] = useState([
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]);

  useEffect(() => {
    const refToFocus = refs?.[value.length];
    if (refToFocus && refToFocus.current) refToFocus.current.focus();
  }, [refs, value]);

  const updateValue = (pos: number) => (e: ChangeEvent<HTMLInputElement>) =>
    setValue((current) => {
      if (current.length === 0 || current.length === pos - 1) {
        return `${current}${e.target.value}`;
      } else if (current.length >= pos) {
        const newValue = current.split("");
        newValue[pos] = e.target.value;
        return newValue.join("");
      }

      return current;
    });

  const deleteValue = (pos: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      setValue((current) => {
        if (current.length > 0 && current.length === pos) {
          return current.slice(0, pos - 1);
        }

        return current;
      });
    }
  };

  const focusCurrentDigit = () => {
    const currentDigit = refs[value.length];
    if (currentDigit && currentDigit.current) currentDigit.current.focus();
  };

  return (
    <>
      <input type="hidden" name="token" value={value} />
      <fieldset className="mt-2 flex gap-2">
        {refs.map((ref, i) => (
          <label key={`digit-${i}`} onClick={focusCurrentDigit}>
            <Input
              type="text"
              className={`${value.length !== i ? "pointer-events-none" : ""}`}
              inputClassName="text-4xl font-bold text-center placeholder:text-teal-600/40"
              value={value.charAt(i)}
              onChange={updateValue(i)}
              onKeyUp={deleteValue(i)}
              placeholder={`${i + 1}`}
              maxLength={1}
              ref={ref}
              colors="border-teal-900 bg-teal-200 text-teal-900"
            />
          </label>
        ))}
      </fieldset>
    </>
  );
}

export default function MultiFactorTOTPSetup() {
  const { qrcode, secret } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <main className="relative flex min-h-screen items-center justify-center gap-4 bg-teal-100">
      <Form className="flex max-w-md flex-col gap-4" method="post">
        <KeyedFlash flashKey="global" flash={actionData} />
        <Panel
          className="flex-1"
          color="bg-teal-200 border-teal-900 text-teal-900"
        >
          <PanelBody className="overflow-hidden bg-white">
            <div className="p-5">
              <h1 className="text-xl font-bold">
                Set up multi-factor authentication
              </h1>
              <p className="text-sm">
                Scan this QRCode with the app you installed in the previous
                step. Once you have it added use the code from the app to
                confirm your two factor setup below.
              </p>
            </div>
            <div className="relative flex items-center justify-center bg-teal-100 p-8">
              <img
                src={qrcode}
                alt="Authenticator QRCode"
                className="h-auto w-32 bg-teal-100"
              />
              <Popover className="absolute bottom-2 right-2 leading-none">
                <Popover.Button className="flex items-center gap-1 rounded-full bg-teal-200 py-1 pl-2 pr-1 text-xs font-medium hover:bg-teal-300">
                  <span>QRCode issues?</span>
                  <InformationCircleIcon
                    className="h-4 w-4 text-teal-700"
                    aria-hidden
                  />
                </Popover.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute bottom-full right-0 mb-2 w-72">
                    <Panel color="bg-teal-200 border-teal-900 text-teal-900">
                      <PanelBody className="bg-white py-5 px-8">
                        <p className="flex flex-col items-start gap-2 text-sm">
                          You can manually setup your app with this secret:
                          <span className="rounded bg-teal-100 py-1 px-2 font-medium">
                            {secret}
                          </span>
                        </p>
                      </PanelBody>
                    </Panel>
                  </Popover.Panel>
                </Transition>
              </Popover>
            </div>
            <div className="flex flex-col gap-3 p-5">
              <ConfirmationCodeInput />
              <KeyedFlash flashKey="token" flash={actionData} />
            </div>
          </PanelBody>
        </Panel>
        <Button type="submit" variant="teal">
          {navigation.state === "idle" ? "Confirm Setup" : "Verifying Code"}
        </Button>
        <Button type="submit" name="cancel" value="true" variant="tealAlt">
          Cancel
        </Button>
      </Form>
    </main>
  );
}

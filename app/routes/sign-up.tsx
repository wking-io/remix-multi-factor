import type { ActionArgs, MetaFunction, SerializeFrom } from "@remix-run/node";
import type { ThrownResponse } from "@remix-run/react";
import type { z, ZodFormattedError } from "zod";

import { json, redirect } from "@remix-run/node";
import { Link, useCatch, useSearchParams } from "@remix-run/react";

import { useEffect, useRef } from "react";
import Button from "~/components/kits/Button";
import Form, {
  FieldError,
  FieldInfo,
  Input,
  Label,
  Password,
} from "~/components/kits/FormKit";
import { Text } from "~/components/kits/Text";
import Container from "~/components/layout/Container";
import { createUser, CreateUser } from "~/models/user.server";
import type { RootLoaderData } from "~/root";
import { setUserSession } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
import { getMetas, getUrl } from "~/utils/seo";

export const meta: MetaFunction = ({ parentsData }) => {
  const { requestInfo } = parentsData.root as SerializeFrom<RootLoaderData>;

  return getMetas({
    title: "Sign Up",
    description: "Get access to the sweetest SaaS starter for Remix.",
    url: getUrl(requestInfo),
  });
};

type RequestErrors = ZodFormattedError<z.infer<typeof CreateUser>>;

export const passwordRequirements = [
  "Minimum 8 characters.",
  "One uppercase letter.",
  "One lowercase letter.",
  "One symbol.",
  "One number.",
];

export async function action({ request }: ActionArgs) {
  const formData = await request.clone().formData();
  const validation = await CreateUser.spa(Object.fromEntries(formData));

  if (!validation.success) {
    const errors = validation.error.format();
    throw json<RequestErrors>(errors, { status: 400 });
  }

  const user = await createUser(validation.data);

  const session = await setUserSession(request, {
    kind: "basic",
    userId: user.id,
  });

  return redirect(`/onboarding/two-factor`, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

function SignUpPage({
  globalError,
  errors,
}: {
  globalError?: string;
  errors?: RequestErrors;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (errors?.firstName) {
      firstNameRef.current?.focus();
    } else if (errors?.lastName) {
      lastNameRef.current?.focus();
    } else if (errors?.email) {
      emailRef.current?.focus();
    } else if (errors?.password) {
      passwordRef.current?.focus();
    } else if (errors?.passwordConfirm) {
      passwordConfirmRef.current?.focus();
    }
  }, [errors]);

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  return (
    <Container className="py-16 lg:py-20" maxWidth="max-w-xl" as="main">
      <div className="text-center">
        <Text variant="heading">Create An Account</Text>
      </div>
      <Form redirectTo={redirectTo} className="mt-12 flex flex-col gap-4">
        {globalError ? (
          <div className="bg-danger-100 text-danger-700 rounded-md py-2 px-3 text-sm">
            {globalError}
          </div>
        ) : null}
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              ref={firstNameRef}
              type="text"
              name="firstName"
              id="firstName"
              required
              aria-invalid={errors?.firstName ? true : undefined}
              aria-describedby="firstName-error"
            />
            <FieldError name="firstName-error" errors={errors?.firstName} />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              ref={lastNameRef}
              type="text"
              name="lastName"
              id="lastName"
              required
              aria-invalid={errors?.lastName ? true : undefined}
              aria-describedby="lastName-error"
            />
            <FieldError name="lastName-error" errors={errors?.lastName} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            ref={emailRef}
            type="email"
            name="email"
            id="email"
            required
            aria-invalid={errors?.email ? true : undefined}
            aria-describedby="email-error"
          />
          <FieldError name="email-error" errors={errors?.email} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-1">
            <Label htmlFor="password">Password</Label>
            <FieldInfo>
              <ul className="flex w-56 list-disc flex-col gap-1 p-4 pl-8 text-sm">
                {passwordRequirements.map((req) => (
                  <li key={req} className="">
                    {req}
                  </li>
                ))}
              </ul>
            </FieldInfo>
          </div>
          <Password
            ref={passwordRef}
            name="password"
            id="password"
            required
            aria-invalid={errors?.password ? true : undefined}
            aria-describedby="password-error"
          />
          <FieldError name="password-error" errors={errors?.password} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="passwordConfirm">Confirm Password</Label>
          <Password
            ref={passwordConfirmRef}
            name="passwordConfirm"
            id="passwordConfirm"
            required
            aria-invalid={errors?.passwordConfirm ? true : undefined}
            aria-describedby="passwordConfirm-error"
          />
          <FieldError
            name="passwordConfirm-error"
            errors={errors?.passwordConfirm}
          />
        </div>
        <Button type="submit">Create Account</Button>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/sign-in"
            className="text-brand hover:text-brand-light hover:underline"
          >
            Sign In
          </Link>
        </p>
      </Form>
    </Container>
  );
}

export default function SignUp() {
  return <SignUpPage />;
}

export function ErrorBoundary() {
  return (
    <SignUpPage globalError="Unknown error occurred while creating your account." />
  );
}

export function CatchBoundary() {
  const caught = useCatch<ThrownResponse<number, RequestErrors>>();
  return <SignUpPage errors={caught.data} />;
}

import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import type { ThrownResponse } from "@remix-run/react";

import { json } from "@remix-run/node";
import { Link, useCatch, useSearchParams } from "@remix-run/react";
import { AuthorizationError } from "remix-auth";

import Button from "~/components/kits/Button";
import Form, { Input, Label, Password } from "~/components/kits/FormKit";
import { Text } from "~/components/kits/Text";
import Container from "~/components/layout/Container";
import type { RootLoaderData } from "~/root";
import { authenticator } from "~/services/auth.server";
import { safeRedirect } from "~/utils/misc.server";
import { getMetas, getUrl } from "~/utils/seo";

export const meta: MetaFunction = ({ parentsData }) => {
  const { requestInfo } = parentsData.root as SerializeFrom<RootLoaderData>;

  return getMetas({
    title: "Sign In",
    description: "Sign into the sweetest SaaS starter for Remix.",
    url: getUrl(requestInfo),
  });
};

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard",
  });
  return null;
}

export async function action({ request }: ActionArgs) {
  const formData = await request.clone().formData();
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/dashboard");

  try {
    return await authenticator.authenticate("user-pass", request, {
      successRedirect: redirectTo,
      throwOnError: true,
    });
  } catch (e) {
    // Because redirects work by throwing a Response, you need to check if the
    // caught error is a response and return it or throw it again
    if (e instanceof Response) return e;
    if (e instanceof AuthorizationError) {
      if (e?.cause?.message) {
        throw json({ message: e.cause.message });
      }
    }

    throw json({ message: "Error logging in." });
  }
}

function SignInPage({ globalError }: { globalError?: string }) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  return (
    <Container className="py-16 lg:py-20" maxWidth="max-w-xl" as="main">
      <div className="text-center">
        <Text variant="heading">Sign Into Account</Text>
      </div>
      <Form redirectTo={redirectTo} className="mt-12 flex flex-col gap-4">
        {globalError ? (
          <div className="bg-danger-100 text-danger-700 rounded-md py-2 px-3 text-sm">
            {globalError}
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input type="email" name="email" id="email" required />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-1">
            <Label htmlFor="password">Password</Label>
          </div>
          <Password name="password" id="password" required />
        </div>
        <Button type="submit">Sign Into Account</Button>
        <div className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            className="text-brand hover:text-brand-light hover:underline"
            to={{
              pathname: "/sign-up",
              search: searchParams.toString(),
            }}
          >
            Sign up
          </Link>
        </div>
      </Form>
    </Container>
  );
}

export default function SignIn() {
  return <SignInPage />;
}

export function ErrorBoundary() {
  return (
    <SignInPage globalError="Unknown error occurred while creating your account." />
  );
}

export function CatchBoundary() {
  const caught = useCatch<ThrownResponse<number, { message?: string }>>();
  return <SignInPage globalError={caught?.data?.message} />;
}

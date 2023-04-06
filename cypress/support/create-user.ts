// Use this to create a new user and login with that user
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts username@example.com
// and it will log out the cookie value you can use to interact with the server
// as that new user.

import { faker } from "@faker-js/faker";
import { installGlobals, redirect } from "@remix-run/node";
import { parse } from "cookie";

import { createUser } from "~/models/user.server";
import { setUserSession } from "~/services/auth.server";
import { sessionStore } from "~/services/session.server";

installGlobals();

async function createAndLogin(email: string) {
  if (!email) {
    throw new Error("email required for login");
  }
  if (!email.endsWith("@example.com")) {
    throw new Error("All test emails must end in @example.com");
  }

  const user = await createUser({
    email,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    password: "Myreallystr0ngpassword!",
    passwordConfirm: "Myreallystr0ngpassword!",
  });

  const session = await setUserSession(new Request("test://test"), {
    kind: "basic",
    userId: user.id,
  });

  const response = redirect("/", {
    headers: {
      "Set-Cookie": await sessionStore.commitSession(session),
    },
  });

  const cookieValue = response.headers.get("Set-Cookie");
  if (!cookieValue) {
    throw new Error("Cookie missing from createUserSession response");
  }
  const parsedCookie = parse(cookieValue);
  // we log it like this so our cypress command can parse it out and set it as
  // the cookie value.
  console.log(
    `
<cookie>
  ${parsedCookie.__session}
</cookie>
  `.trim()
  );
}

createAndLogin(process.argv[2]);

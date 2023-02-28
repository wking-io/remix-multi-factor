import type { Prisma, User as UserSchema } from "@prisma/client";

import bcrypt from "bcryptjs";
import { AuthorizationError } from "remix-auth";
import isAlpha from "validator/lib/isAlpha";
import isStrongPassword from "validator/lib/isStrongPassword";
import { z } from "zod";
import { prisma } from "~/db.server";

export type User = Pick<UserSchema, "email" | "firstName" | "id">;

export const CreateUser = z
  .object({
    firstName: z.string().refine(
      (val) => isAlpha(val, "en-US", { ignore: " " }),
      () => ({ message: "Names must be only include letters or spaces." })
    ),
    lastName: z.string().refine(
      (val) => isAlpha(val, "en-US", { ignore: " " }),
      () => ({ message: "Names must be only include letters or spaces." })
    ),
    email: z
      .string()
      .email()
      .refine(
        async (email) => Boolean(getUserByEmail(email)),
        () => ({ message: "User with that email already exists." })
      ),
    password: z
      .string()
      .min(8)
      .refine(isStrongPassword, () => ({
        message: "Must include at least one upper, lower, number, and symbol",
      })),
    passwordConfirm: z.string(),
  })
  .refine(
    ({ password, passwordConfirm }) => password === passwordConfirm,
    () => ({
      path: ["passwordConfirm"],
      message: "Must match password.",
    })
  );

export async function createUser({
  password,
  passwordConfirm,
  ...userArgs
}: z.infer<typeof CreateUser>) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      ...userArgs,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
    },
  });

  return user;
}

export const VerifyLogin = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function verifyLogin({
  email,
  password,
}: z.infer<typeof VerifyLogin>) {
  const userWithPassword = await prisma.user.findUniqueOrThrow({
    where: { email },
    select: {
      id: true,
      password: { select: { hash: true } },
    },
  });

  if (!userWithPassword.password?.hash) {
    throw new AuthorizationError("User password not found");
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password?.hash
  );

  if (!isValid) {
    throw new AuthorizationError("Password is not valid");
  }

  return {
    userId: userWithPassword.id,
  };
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true },
  });
}

const userSelect = {
  id: true,
  email: true,
} satisfies Prisma.UserSelect;

function payloadToUser({
  ...user
}: Prisma.UserGetPayload<{ select: typeof userSelect }>) {
  return { ...user };
}

export async function getUserById(id: User["id"]) {
  return payloadToUser(
    await prisma.user.findUniqueOrThrow({ where: { id }, select: userSelect })
  );
}

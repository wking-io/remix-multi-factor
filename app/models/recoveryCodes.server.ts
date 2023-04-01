import {
  Prisma,
  RecoveryCode as RecoveryCodeSchema,
  User,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/services/db.server";

export type RecoveryCode = Pick<RecoveryCodeSchema, "hash" | "usedAt">;
export function listRecoveryCodes({
  userId,
}: {
  userId: User["id"];
}): Promise<RecoveryCode[] | null> {
  return prisma.recoveryCode.findMany({
    select: { hash: true, usedAt: true },
    where: { userId },
    take: 10,
  });
}

export async function createRecoveryCodes({
  recoveryCodes,
  userId,
}: {
  userId: User["id"];
  recoveryCodes: string[];
}) {
  if (recoveryCodes.length !== 10)
    throw new Error("Not the correct number of recovery codes.");

  /**
   * Here we are using Promise.all to loop through all of the recovery codes
   * and run an async hashing function on them. We are then constructing
   * the object that Prisma is expecting in the createMany operation below
   * at the same time with vs mapping twice after we get the result.
   */
  const hashedCodes = await Promise.all(
    recoveryCodes.map(
      async (code): Promise<Prisma.RecoveryCodeCreateManyInput> => ({
        hash: await bcrypt.hash(code, 10),
        userId,
      })
    )
  );

  await prisma.recoveryCode.createMany({
    data: hashedCodes,
  });
}

export async function deleteRecoveryCodes(userId: string) {
  await prisma.recoveryCode.deleteMany({ where: { userId } });
}

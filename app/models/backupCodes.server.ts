import { BackupCode as BackupCodeSchema, Prisma, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/services/db.server";

export type BackupCode = Pick<BackupCodeSchema, "hash" | "usedAt">;
export function listBackupCodes({
  userId,
}: {
  userId: User["id"];
}): Promise<BackupCode[] | null> {
  return prisma.backupCode.findMany({
    select: { hash: true, usedAt: true },
    where: { userId },
    take: 10,
  });
}

export async function createBackupCodes({
  backupCodes,
  userId,
}: {
  userId: User["id"];
  backupCodes: string[];
}) {
  if (backupCodes.length !== 10)
    throw new Error("Not the correct number of backup codes.");

  /**
   * Here we are using Promise.all to loop through all of the backup codes
   * and run an async hashing function on them. We are then constructing
   * the object that Prisma is expecting in the createMany operation below
   * at the same time with vs mapping twice after we get the result.
   */
  const hashedCodes = await Promise.all(
    backupCodes.map(
      async (code): Promise<Prisma.BackupCodeCreateManyInput> => ({
        hash: await bcrypt.hash(code, 10),
        userId,
      })
    )
  );

  await prisma.backupCode.createMany({
    data: hashedCodes,
  });
}

export async function deleteBackupCodes(userId: string) {
  await prisma.backupCode.deleteMany({ where: { userId } });
}

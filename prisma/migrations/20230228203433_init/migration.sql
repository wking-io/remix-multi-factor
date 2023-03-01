-- CreateTable
CREATE TABLE "user" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TwoFactor" (
    "two_factor_id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "TwoFactor_pkey" PRIMARY KEY ("two_factor_id")
);

-- CreateTable
CREATE TABLE "two_factor_topt" (
    "secret" TEXT NOT NULL,
    "user_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "backup_code" (
    "hash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "user_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_userId_key" ON "password"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactor_user_id_key" ON "TwoFactor"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactor_is_default_user_id_key" ON "TwoFactor"("is_default", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_topt_user_id_key" ON "two_factor_topt"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "backup_code_hash_key" ON "backup_code"("hash");

-- CreateIndex
CREATE INDEX "backup_code_hash_idx" ON "backup_code"("hash");

-- AddForeignKey
ALTER TABLE "password" ADD CONSTRAINT "password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactor" ADD CONSTRAINT "TwoFactor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_topt" ADD CONSTRAINT "two_factor_topt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup_code" ADD CONSTRAINT "backup_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

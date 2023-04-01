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
CREATE TABLE "multi_factor" (
    "multi_factor_id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "multi_factor_pkey" PRIMARY KEY ("multi_factor_id")
);

-- CreateTable
CREATE TABLE "multi_factor_topt" (
    "secret" TEXT NOT NULL,
    "multi_factor_totp_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "multi_factor_topt_pkey" PRIMARY KEY ("multi_factor_totp_id")
);

-- CreateTable
CREATE TABLE "recovery_code" (
    "hash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "user_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_userId_key" ON "password"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "multi_factor_user_id_key" ON "multi_factor"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "multi_factor_topt_user_id_key" ON "multi_factor_topt"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "recovery_code_hash_key" ON "recovery_code"("hash");

-- CreateIndex
CREATE INDEX "recovery_code_hash_idx" ON "recovery_code"("hash");

-- AddForeignKey
ALTER TABLE "password" ADD CONSTRAINT "password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi_factor" ADD CONSTRAINT "multi_factor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi_factor_topt" ADD CONSTRAINT "multi_factor_topt_multi_factor_totp_id_fkey" FOREIGN KEY ("multi_factor_totp_id") REFERENCES "multi_factor"("multi_factor_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "multi_factor_topt" ADD CONSTRAINT "multi_factor_topt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recovery_code" ADD CONSTRAINT "recovery_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

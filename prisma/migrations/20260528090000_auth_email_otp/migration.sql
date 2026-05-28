-- CreateEnum
CREATE TYPE "AuthOtpPurpose" AS ENUM ('email_verification', 'password_reset');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

UPDATE "User"
SET "emailVerifiedAt" = NOW()
WHERE "emailVerifiedAt" IS NULL;

-- CreateTable
CREATE TABLE "AuthOtp" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "purpose" "AuthOtpPurpose" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthOtp_email_purpose_expiresAt_idx" ON "AuthOtp"("email", "purpose", "expiresAt");

-- CreateIndex
CREATE INDEX "AuthOtp_userId_purpose_idx" ON "AuthOtp"("userId", "purpose");

-- AddForeignKey
ALTER TABLE "AuthOtp" ADD CONSTRAINT "AuthOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

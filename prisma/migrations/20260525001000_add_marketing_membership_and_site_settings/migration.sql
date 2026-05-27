ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'marketing_pending';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'marketing_verified';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'portfolio';

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "membershipCycle" TEXT,
  ADD COLUMN IF NOT EXISTS "membershipStatus" TEXT DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS "membershipStartedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "membershipEndsAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "billingProvider" TEXT DEFAULT 'gcash';

ALTER TABLE "VerificationRequest"
  ADD COLUMN IF NOT EXISTS "verificationType" TEXT NOT NULL DEFAULT 'business',
  ADD COLUMN IF NOT EXISTS "portfolioUrl" TEXT;

CREATE TABLE IF NOT EXISTS "SiteSetting" (
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

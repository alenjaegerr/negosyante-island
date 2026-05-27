-- AlterTable
ALTER TABLE "User"
ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "loginCooldownUntil" TIMESTAMP(3),
ADD COLUMN "loginThrottleStage" INTEGER NOT NULL DEFAULT 0;

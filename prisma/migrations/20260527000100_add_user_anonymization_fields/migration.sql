ALTER TABLE "User"
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "anonymizedAt" TIMESTAMP(3),
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "User_isDeleted_idx" ON "User"("isDeleted");

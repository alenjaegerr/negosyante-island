-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'publisher';
ALTER TYPE "Role" ADD VALUE 'publisher_verified';

-- DropIndex
DROP INDEX IF EXISTS "User_isDeleted_idx";

-- AlterTable
ALTER TABLE "TrendingPost" ADD COLUMN     "authorId" TEXT;

-- CreateIndex
CREATE INDEX "TrendingPost_authorId_idx" ON "TrendingPost"("authorId");

-- AddForeignKey
ALTER TABLE "TrendingPost" ADD CONSTRAINT "TrendingPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

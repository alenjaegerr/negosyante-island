-- AlterTable
ALTER TABLE "ForumComment" ADD COLUMN     "mediaType" TEXT,
ADD COLUMN     "mediaUrl" TEXT;

-- AlterTable
ALTER TABLE "ForumThread" ADD COLUMN     "mediaType" TEXT,
ADD COLUMN     "mediaUrl" TEXT;

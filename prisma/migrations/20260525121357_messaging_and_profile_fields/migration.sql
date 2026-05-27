-- AlterTable
ALTER TABLE "User" ADD COLUMN     "businessCategory" TEXT,
ADD COLUMN     "businessLocation" TEXT,
ADD COLUMN     "businessTagline" TEXT;

-- CreateTable
CREATE TABLE "PostComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessChatThread" (
    "id" TEXT NOT NULL,
    "businessSlug" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessChatMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostComment_postId_createdAt_idx" ON "PostComment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "BusinessChatThread_businessSlug_updatedAt_idx" ON "BusinessChatThread"("businessSlug", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessChatThread_businessSlug_participantId_key" ON "BusinessChatThread"("businessSlug", "participantId");

-- CreateIndex
CREATE INDEX "BusinessChatMessage_threadId_createdAt_idx" ON "BusinessChatMessage"("threadId", "createdAt");

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessChatThread" ADD CONSTRAINT "BusinessChatThread_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessChatMessage" ADD CONSTRAINT "BusinessChatMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "BusinessChatThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessChatMessage" ADD CONSTRAINT "BusinessChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

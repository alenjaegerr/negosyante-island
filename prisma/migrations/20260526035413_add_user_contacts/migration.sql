-- CreateTable
CREATE TABLE "UserContact" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "contactKey" TEXT NOT NULL,
    "profileType" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" TEXT,
    "businessSlug" TEXT,
    "businessCategory" TEXT,
    "businessLocation" TEXT,
    "businessTagline" TEXT,
    "profileHref" TEXT,
    "sourceConversationId" TEXT,
    "sourceBusinessMessageId" TEXT,
    "lastInteractionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserContact_ownerUserId_lastInteractionAt_idx" ON "UserContact"("ownerUserId", "lastInteractionAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserContact_ownerUserId_contactKey_key" ON "UserContact"("ownerUserId", "contactKey");

-- AddForeignKey
ALTER TABLE "UserContact" ADD CONSTRAINT "UserContact_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TrendingPost"
ADD COLUMN     "insightStats" JSONB,
ADD COLUMN     "insightSignals" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "insightUpdatedAt" TIMESTAMP(3);

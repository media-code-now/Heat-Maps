-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RankSource" AS ENUM ('MOCK', 'DATAFORSEO');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "website" TEXT,
    "googleBusinessProfileName" TEXT,
    "placeId" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keywords" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scans" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "gridSize" INTEGER NOT NULL,
    "radiusMiles" DOUBLE PRECISION NOT NULL,
    "centerLatitude" DOUBLE PRECISION NOT NULL,
    "centerLongitude" DOUBLE PRECISION NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "source" "RankSource" NOT NULL DEFAULT 'MOCK',
    "avgRank" DOUBLE PRECISION,
    "visibilityScore" INTEGER,
    "top3Percentage" INTEGER,
    "notFoundPercentage" INTEGER,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_grid_points" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_grid_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_results" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "gridPointId" TEXT NOT NULL,
    "rank" INTEGER,
    "notFound" BOOLEAN NOT NULL DEFAULT false,
    "matchedTitle" TEXT,
    "matchedUrl" TEXT,
    "matchedPlaceId" TEXT,
    "resultUrls" TEXT[],
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_competitors" (
    "id" TEXT NOT NULL,
    "rankingResultId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rank" INTEGER,
    "url" TEXT,
    "placeId" TEXT,
    "rating" DOUBLE PRECISION,
    "address" TEXT,

    CONSTRAINT "ranking_competitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shareSlug" TEXT NOT NULL,
    "summary" JSONB,
    "insights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_userId_createdAt_idx" ON "projects"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "projects_businessName_idx" ON "projects"("businessName");

-- CreateIndex
CREATE INDEX "keywords_phrase_idx" ON "keywords"("phrase");

-- CreateIndex
CREATE UNIQUE INDEX "keywords_projectId_phrase_key" ON "keywords"("projectId", "phrase");

-- CreateIndex
CREATE INDEX "scans_projectId_createdAt_idx" ON "scans"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "scans_keywordId_createdAt_idx" ON "scans"("keywordId", "createdAt");

-- CreateIndex
CREATE INDEX "scan_grid_points_scanId_idx" ON "scan_grid_points"("scanId");

-- CreateIndex
CREATE UNIQUE INDEX "scan_grid_points_scanId_row_column_key" ON "scan_grid_points"("scanId", "row", "column");

-- CreateIndex
CREATE UNIQUE INDEX "ranking_results_gridPointId_key" ON "ranking_results"("gridPointId");

-- CreateIndex
CREATE INDEX "ranking_results_scanId_idx" ON "ranking_results"("scanId");

-- CreateIndex
CREATE INDEX "ranking_results_rank_idx" ON "ranking_results"("rank");

-- CreateIndex
CREATE INDEX "ranking_competitors_rankingResultId_idx" ON "ranking_competitors"("rankingResultId");

-- CreateIndex
CREATE UNIQUE INDEX "reports_shareSlug_key" ON "reports"("shareSlug");

-- CreateIndex
CREATE INDEX "reports_projectId_createdAt_idx" ON "reports"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "reports_scanId_idx" ON "reports"("scanId");

-- AddForeignKey
ALTER TABLE "keywords" ADD CONSTRAINT "keywords_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "keywords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_grid_points" ADD CONSTRAINT "scan_grid_points_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_results" ADD CONSTRAINT "ranking_results_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_results" ADD CONSTRAINT "ranking_results_gridPointId_fkey" FOREIGN KEY ("gridPointId") REFERENCES "scan_grid_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_competitors" ADD CONSTRAINT "ranking_competitors_rankingResultId_fkey" FOREIGN KEY ("rankingResultId") REFERENCES "ranking_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

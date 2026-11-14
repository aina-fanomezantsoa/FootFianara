-- AlterTable
ALTER TABLE "Suspension" ADD COLUMN     "matchId" INTEGER,
ADD COLUMN     "seasonId" INTEGER;

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

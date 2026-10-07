/*
  Warnings:

  - You are about to alter the column `appliedTest` on the `personnelcandidatepsychotechnicaltest` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(150)`.

*/
-- AlterTable
ALTER TABLE `personnelcandidatecompetencyevaluation` MODIFY `generalConcept` VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE `personnelcandidatepsychotechnicaltest` MODIFY `appliedTest` VARCHAR(150) NOT NULL;

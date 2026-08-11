/*
  Warnings:

  - Made the column `otherReason` on table `personnelrequisition` required. This step will fail if there are existing NULL values in that column.
  - Made the column `positionRevisionId` on table `personnelrequisition` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `personnelrequisition` DROP FOREIGN KEY `PersonnelRequisition_positionRevisionId_fkey`;

-- AlterTable
ALTER TABLE `personnelrequisition` MODIFY `otherReason` VARCHAR(300) NOT NULL,
    MODIFY `positionRevisionId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `PersonnelRequisition` ADD CONSTRAINT `PersonnelRequisition_positionRevisionId_fkey` FOREIGN KEY (`positionRevisionId`) REFERENCES `PositionProfileRevision`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

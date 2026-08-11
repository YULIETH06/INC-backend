/*
  Warnings:

  - A unique constraint covering the columns `[requisitionId,identificationTypeId,identificationNumber]` on the table `PersonnelRequisitionCandidate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identificationNumber` to the `PersonnelRequisitionCandidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identificationTypeId` to the `PersonnelRequisitionCandidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `personnelrequisitioncandidate` ADD COLUMN `identificationNumber` VARCHAR(50) NOT NULL,
    ADD COLUMN `identificationTypeId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `IdentificationType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `IdentificationType_code_key`(`code`),
    UNIQUE INDEX `IdentificationType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PersonnelRequisitionCandidate_identificationTypeId_idx` ON `PersonnelRequisitionCandidate`(`identificationTypeId`);

-- CreateIndex
CREATE UNIQUE INDEX `PersonnelRequisitionCandidate_requisitionId_identificationTy_key` ON `PersonnelRequisitionCandidate`(`requisitionId`, `identificationTypeId`, `identificationNumber`);

-- AddForeignKey
ALTER TABLE `PersonnelRequisitionCandidate` ADD CONSTRAINT `PersonnelRequisitionCandidate_identificationTypeId_fkey` FOREIGN KEY (`identificationTypeId`) REFERENCES `IdentificationType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

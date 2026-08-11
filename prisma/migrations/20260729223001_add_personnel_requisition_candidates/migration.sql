-- AlterTable
ALTER TABLE `personnelrequisition` ADD COLUMN `candidateSubmissionClosedAt` DATETIME(3) NULL,
    ADD COLUMN `candidateSubmissionStatus` ENUM('NO_INICIADA', 'ABIERTA', 'CERRADA') NOT NULL DEFAULT 'NO_INICIADA';

-- CreateTable
CREATE TABLE `PersonnelRequisitionCandidate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requisitionId` INTEGER NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `observation` VARCHAR(500) NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `uploadedById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PersonnelRequisitionCandidate_requisitionId_idx`(`requisitionId`),
    INDEX `PersonnelRequisitionCandidate_uploadedById_idx`(`uploadedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PersonnelRequisition_candidateSubmissionStatus_idx` ON `PersonnelRequisition`(`candidateSubmissionStatus`);

-- AddForeignKey
ALTER TABLE `PersonnelRequisitionCandidate` ADD CONSTRAINT `PersonnelRequisitionCandidate_requisitionId_fkey` FOREIGN KEY (`requisitionId`) REFERENCES `PersonnelRequisition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelRequisitionCandidate` ADD CONSTRAINT `PersonnelRequisitionCandidate_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

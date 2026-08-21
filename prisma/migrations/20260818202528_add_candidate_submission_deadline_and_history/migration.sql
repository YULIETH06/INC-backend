-- AlterTable
ALTER TABLE `personnelrequisition` ADD COLUMN `candidateSubmissionDeadlineAt` DATETIME(3) NULL,
    ADD COLUMN `candidateSubmissionLateReason` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `PersonnelCandidateSubmissionHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requisitionId` INTEGER NOT NULL,
    `action` ENUM('REAPERTURA', 'CIERRE') NOT NULL,
    `reason` VARCHAR(500) NULL,
    `performedById` INTEGER NOT NULL,
    `performedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PersonnelCandidateSubmissionHistory_requisitionId_idx`(`requisitionId`),
    INDEX `PersonnelCandidateSubmissionHistory_performedById_idx`(`performedById`),
    INDEX `PersonnelCandidateSubmissionHistory_action_idx`(`action`),
    INDEX `PersonnelCandidateSubmissionHistory_performedAt_idx`(`performedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateSubmissionHistory` ADD CONSTRAINT `PersonnelCandidateSubmissionHistory_requisitionId_fkey` FOREIGN KEY (`requisitionId`) REFERENCES `PersonnelRequisition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateSubmissionHistory` ADD CONSTRAINT `PersonnelCandidateSubmissionHistory_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

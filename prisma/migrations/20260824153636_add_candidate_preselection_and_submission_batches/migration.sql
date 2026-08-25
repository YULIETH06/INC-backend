-- AlterTable
ALTER TABLE `personnelrequisitioncandidate` ADD COLUMN `isPreselected` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `preselectedAt` DATETIME(3) NULL,
    ADD COLUMN `preselectedById` INTEGER NULL;

-- CreateTable
CREATE TABLE `PersonnelCandidateSubmissionBatch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requisitionId` INTEGER NOT NULL,
    `submissionNumber` INTEGER NOT NULL,
    `closedById` INTEGER NOT NULL,
    `closedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PersonnelCandidateSubmissionBatch_requisitionId_idx`(`requisitionId`),
    INDEX `PersonnelCandidateSubmissionBatch_closedById_idx`(`closedById`),
    INDEX `PersonnelCandidateSubmissionBatch_closedAt_idx`(`closedAt`),
    UNIQUE INDEX `PersonnelCandidateSubmissionBatch_requisitionId_submissionNu_key`(`requisitionId`, `submissionNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonnelCandidateSubmissionBatchItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `submissionBatchId` INTEGER NOT NULL,
    `itemNumber` INTEGER NOT NULL,
    `candidateId` INTEGER NULL,
    `candidateName` VARCHAR(150) NOT NULL,
    `identificationTypeCode` VARCHAR(20) NOT NULL,
    `identificationNumber` VARCHAR(50) NOT NULL,

    INDEX `PersonnelCandidateSubmissionBatchItem_submissionBatchId_idx`(`submissionBatchId`),
    INDEX `PersonnelCandidateSubmissionBatchItem_candidateId_idx`(`candidateId`),
    UNIQUE INDEX `PersonnelCandidateSubmissionBatchItem_submissionBatchId_item_key`(`submissionBatchId`, `itemNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PersonnelRequisitionCandidate_isPreselected_idx` ON `PersonnelRequisitionCandidate`(`isPreselected`);

-- CreateIndex
CREATE INDEX `PersonnelRequisitionCandidate_preselectedById_idx` ON `PersonnelRequisitionCandidate`(`preselectedById`);

-- AddForeignKey
ALTER TABLE `PersonnelCandidateSubmissionBatch` ADD CONSTRAINT `PersonnelCandidateSubmissionBatch_requisitionId_fkey` FOREIGN KEY (`requisitionId`) REFERENCES `PersonnelRequisition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateSubmissionBatch` ADD CONSTRAINT `PersonnelCandidateSubmissionBatch_closedById_fkey` FOREIGN KEY (`closedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateSubmissionBatchItem` ADD CONSTRAINT `PersonnelCandidateSubmissionBatchItem_submissionBatchId_fkey` FOREIGN KEY (`submissionBatchId`) REFERENCES `PersonnelCandidateSubmissionBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateSubmissionBatchItem` ADD CONSTRAINT `PersonnelCandidateSubmissionBatchItem_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `PersonnelRequisitionCandidate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelRequisitionCandidate` ADD CONSTRAINT `PersonnelRequisitionCandidate_preselectedById_fkey` FOREIGN KEY (`preselectedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

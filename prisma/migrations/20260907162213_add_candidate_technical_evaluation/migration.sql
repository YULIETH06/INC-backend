-- AlterTable
ALTER TABLE `notification` MODIFY `type` ENUM('NEW_PQR', 'STATUS_CHANGE', 'PRIORITY_CHANGE', 'PQR_CLOSED', 'PQR_RATED', 'PQR_TAKEN', 'PQR_ASSIGNED', 'PQR_UNASSIGNED', 'REQUISITION_PENDING_APPROVAL', 'REQUISITION_APPROVED', 'REQUISITION_REJECTED', 'HIRING_CONFIRMATION_PENDING', 'HIRING_CONFIRMATION_APPROVED', 'HIRING_CONFIRMATION_REJECTED', 'REQUISITION_CANDIDATES_PENDING', 'REQUISITION_CANDIDATES_WITHOUT_ASSISTANT', 'REQUISITION_CANDIDATES_CLOSED', 'REQUISITION_CANDIDATES_REOPENED', 'CANDIDATE_TECHNICAL_EVALUATION_PENDING') NOT NULL;

-- CreateTable
CREATE TABLE `PersonnelCandidateTechnicalEvaluation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidateValidationId` INTEGER NOT NULL,
    `interviewScore` DECIMAL(2, 1) NULL,
    `interviewRecordedAt` DATETIME(3) NULL,
    `examScore` DECIMAL(2, 1) NULL,
    `examRecordedAt` DATETIME(3) NULL,
    `status` ENUM('EN_REGISTRO', 'PENDIENTE_APROBACION', 'APROBADA') NOT NULL DEFAULT 'EN_REGISTRO',
    `enteredById` INTEGER NOT NULL,
    `isSuitable` BOOLEAN NULL,
    `approvedById` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PersonnelCandidateTechnicalEvaluation_candidateValidationId_key`(`candidateValidationId`),
    INDEX `PersonnelCandidateTechnicalEvaluation_enteredById_idx`(`enteredById`),
    INDEX `PersonnelCandidateTechnicalEvaluation_approvedById_idx`(`approvedById`),
    INDEX `PersonnelCandidateTechnicalEvaluation_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateTechnicalEvaluation` ADD CONSTRAINT `PersonnelCandidateTechnicalEvaluation_candidateValidationId_fkey` FOREIGN KEY (`candidateValidationId`) REFERENCES `PersonnelCandidateValidation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateTechnicalEvaluation` ADD CONSTRAINT `PersonnelCandidateTechnicalEvaluation_enteredById_fkey` FOREIGN KEY (`enteredById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateTechnicalEvaluation` ADD CONSTRAINT `PersonnelCandidateTechnicalEvaluation_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

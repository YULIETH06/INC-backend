-- CreateTable
CREATE TABLE `PersonnelCandidateValidation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidateId` INTEGER NOT NULL,
    `applicationConcept` ENUM('INGRESO', 'MODIFICACION_CARGO') NOT NULL,
    `positionType` ENUM('NUEVO_CARGO', 'CARGO_EXISTENTE') NULL,
    `changeControlCode` VARCHAR(100) NULL,
    `isPositionProfileCurrent` BOOLEAN NULL,
    `isSuitable` BOOLEAN NULL,
    `performedById` INTEGER NULL,
    `completedStep` INTEGER NOT NULL DEFAULT 1,
    `validatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PersonnelCandidateValidation_candidateId_key`(`candidateId`),
    INDEX `PersonnelCandidateValidation_performedById_idx`(`performedById`),
    INDEX `PersonnelCandidateValidation_completedStep_idx`(`completedStep`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonnelCandidateRequirementValidation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidateValidationId` INTEGER NOT NULL,
    `requirementDescriptionId` INTEGER NOT NULL,
    `complies` BOOLEAN NOT NULL,
    `evidence` VARCHAR(1000) NULL,
    `gapClosure` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PersonnelCandidateRequirementValidation_candidateValidationI_idx`(`candidateValidationId`),
    INDEX `PersonnelCandidateRequirementValidation_requirementDescripti_idx`(`requirementDescriptionId`),
    UNIQUE INDEX `PersonnelCandidateRequirementValidation_candidateValidationI_key`(`candidateValidationId`, `requirementDescriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateValidation` ADD CONSTRAINT `PersonnelCandidateValidation_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `PersonnelRequisitionCandidate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateValidation` ADD CONSTRAINT `PersonnelCandidateValidation_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateRequirementValidation` ADD CONSTRAINT `PersonnelCandidateRequirementValidation_candidateValidation_fkey` FOREIGN KEY (`candidateValidationId`) REFERENCES `PersonnelCandidateValidation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateRequirementValidation` ADD CONSTRAINT `PersonnelCandidateRequirementValidation_requirementDescript_fkey` FOREIGN KEY (`requirementDescriptionId`) REFERENCES `PositionRequirementDescription`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

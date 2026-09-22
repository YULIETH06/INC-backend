-- CreateTable
CREATE TABLE `CompetencyType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CompetencyType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PositionCompetencyDescription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `revisionId` INTEGER NOT NULL,
    `competencyTypeId` INTEGER NOT NULL,
    `competency` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `PositionCompetencyDescription_revisionId_idx`(`revisionId`),
    INDEX `PositionCompetencyDescription_competencyTypeId_idx`(`competencyTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonnelCandidatePsychotechnicalTest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidateValidationId` INTEGER NOT NULL,
    `appliedTest` VARCHAR(191) NOT NULL,
    `appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `evaluationAspects` TEXT NOT NULL,
    `resultDescription` TEXT NOT NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PersonnelCandidatePsychotechnicalTest_candidateValidationId_idx`(`candidateValidationId`),
    INDEX `PersonnelCandidatePsychotechnicalTest_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonnelCandidateCompetencyValidation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidateValidationId` INTEGER NOT NULL,
    `competencyDescriptionId` INTEGER NOT NULL,
    `result` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PersonnelCandidateCompetencyValidation_candidateValidationId_idx`(`candidateValidationId`),
    INDEX `PersonnelCandidateCompetencyValidation_competencyDescription_idx`(`competencyDescriptionId`),
    UNIQUE INDEX `PersonnelCandidateCompetencyValidation_candidateValidationId_key`(`candidateValidationId`, `competencyDescriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonnelCandidateCompetencyEvaluation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidateValidationId` INTEGER NOT NULL,
    `generalConcept` VARCHAR(191) NOT NULL,
    `isSuitable` BOOLEAN NOT NULL,
    `validatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `performedById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PersonnelCandidateCompetencyEvaluation_performedById_idx`(`performedById`),
    UNIQUE INDEX `PersonnelCandidateCompetencyEvaluation_candidateValidationId_key`(`candidateValidationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PositionCompetencyDescription` ADD CONSTRAINT `PositionCompetencyDescription_revisionId_fkey` FOREIGN KEY (`revisionId`) REFERENCES `PositionProfileRevision`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PositionCompetencyDescription` ADD CONSTRAINT `PositionCompetencyDescription_competencyTypeId_fkey` FOREIGN KEY (`competencyTypeId`) REFERENCES `CompetencyType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidatePsychotechnicalTest` ADD CONSTRAINT `PersonnelCandidatePsychotechnicalTest_candidateValidationId_fkey` FOREIGN KEY (`candidateValidationId`) REFERENCES `PersonnelCandidateValidation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidatePsychotechnicalTest` ADD CONSTRAINT `PersonnelCandidatePsychotechnicalTest_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateCompetencyValidation` ADD CONSTRAINT `PersonnelCandidateCompetencyValidation_candidateValidationI_fkey` FOREIGN KEY (`candidateValidationId`) REFERENCES `PersonnelCandidateValidation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateCompetencyValidation` ADD CONSTRAINT `PersonnelCandidateCompetencyValidation_competencyDescriptio_fkey` FOREIGN KEY (`competencyDescriptionId`) REFERENCES `PositionCompetencyDescription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateCompetencyEvaluation` ADD CONSTRAINT `PersonnelCandidateCompetencyEvaluation_candidateValidationI_fkey` FOREIGN KEY (`candidateValidationId`) REFERENCES `PersonnelCandidateValidation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelCandidateCompetencyEvaluation` ADD CONSTRAINT `PersonnelCandidateCompetencyEvaluation_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

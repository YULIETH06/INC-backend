-- AlterTable
ALTER TABLE `personnelrequisition` ADD COLUMN `positionRevisionId` INTEGER NULL;

-- CreateTable
CREATE TABLE `PositionRequirement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `PositionRequirement_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PositionProfileRevision` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `positionProfileId` INTEGER NOT NULL,
    `revisionNumber` INTEGER NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('BORRADOR', 'VIGENTE', 'OBSOLETA') NOT NULL DEFAULT 'BORRADOR',
    `changeObservation` VARCHAR(500) NULL,
    `deletedAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PositionProfileRevision_positionProfileId_status_deletedAt_idx`(`positionProfileId`, `status`, `deletedAt`),
    UNIQUE INDEX `PositionProfileRevision_positionProfileId_revisionNumber_key`(`positionProfileId`, `revisionNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PositionRequirementDescription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `revisionId` INTEGER NOT NULL,
    `requirementId` INTEGER NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `PositionRequirementDescription_requirementId_idx`(`requirementId`),
    INDEX `PositionRequirementDescription_revisionId_requirementId_dele_idx`(`revisionId`, `requirementId`, `deletedAt`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PersonnelRequisition_positionRevisionId_idx` ON `PersonnelRequisition`(`positionRevisionId`);

-- AddForeignKey
ALTER TABLE `PositionProfileRevision` ADD CONSTRAINT `PositionProfileRevision_positionProfileId_fkey` FOREIGN KEY (`positionProfileId`) REFERENCES `PositionProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PositionRequirementDescription` ADD CONSTRAINT `PositionRequirementDescription_revisionId_fkey` FOREIGN KEY (`revisionId`) REFERENCES `PositionProfileRevision`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PositionRequirementDescription` ADD CONSTRAINT `PositionRequirementDescription_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `PositionRequirement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelRequisition` ADD CONSTRAINT `PersonnelRequisition_positionRevisionId_fkey` FOREIGN KEY (`positionRevisionId`) REFERENCES `PositionProfileRevision`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

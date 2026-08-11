/*
  Warnings:

  - You are about to drop the column `status` on the `personnelrequisition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `notification` ADD COLUMN `personnelRequisitionId` INTEGER NULL,
    MODIFY `type` ENUM('NEW_PQR', 'STATUS_CHANGE', 'PRIORITY_CHANGE', 'PQR_CLOSED', 'PQR_RATED', 'PQR_TAKEN', 'PQR_ASSIGNED', 'PQR_UNASSIGNED', 'REQUISITION_PENDING_APPROVAL', 'REQUISITION_APPROVED', 'REQUISITION_REJECTED', 'HIRING_CONFIRMATION_PENDING', 'HIRING_CONFIRMATION_APPROVED', 'HIRING_CONFIRMATION_REJECTED') NOT NULL;

-- AlterTable
ALTER TABLE `personnelrequisition` DROP COLUMN `status`;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('USER', 'ADMIN', 'AGENT', 'JEFE_AREA', 'JEFE_DEPARTAMENTO', 'GERENTE_GENERAL', 'ANALISTA_TALENTO_HUMANO', 'JEFE_TALENTO_HUMANO') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `RequisitionApprovalStep` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `stepOrder` INTEGER NOT NULL,
    `requiredRole` ENUM('USER', 'ADMIN', 'AGENT', 'JEFE_AREA', 'JEFE_DEPARTAMENTO', 'GERENTE_GENERAL', 'ANALISTA_TALENTO_HUMANO', 'JEFE_TALENTO_HUMANO') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RequisitionApprovalStep_stepOrder_key`(`stepOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonnelRequisitionApproval` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requisitionId` INTEGER NOT NULL,
    `stepId` INTEGER NOT NULL,
    `decision` ENUM('APROBADA', 'RECHAZADA', 'CANCELADA') NOT NULL,
    `decidedById` INTEGER NOT NULL,
    `decidedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `comment` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PersonnelRequisitionApproval_requisitionId_stepId_key`(`requisitionId`, `stepId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonnelHiringConfirmation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requisitionId` INTEGER NOT NULL,
    `contractType` ENUM('DIRECTO', 'TEMPORAL', 'PRACTICANTE') NOT NULL,
    `directContractType` ENUM('INDEFINIDO', 'FIJO') NULL,
    `contractDurationMonths` INTEGER NULL,
    `internContractType` ENUM('APRENDIZ', 'PASANTE', 'ROTANTE') NULL,
    `approvedSalary` DECIMAL(12, 2) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PersonnelHiringConfirmation_requisitionId_key`(`requisitionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HiringConfirmationApprovalStep` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `stepOrder` INTEGER NOT NULL,
    `requiredRole` ENUM('USER', 'ADMIN', 'AGENT', 'JEFE_AREA', 'JEFE_DEPARTAMENTO', 'GERENTE_GENERAL', 'ANALISTA_TALENTO_HUMANO', 'JEFE_TALENTO_HUMANO') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HiringConfirmationApprovalStep_stepOrder_key`(`stepOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonnelHiringConfirmationApproval` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hiringConfirmationId` INTEGER NOT NULL,
    `stepId` INTEGER NOT NULL,
    `decision` ENUM('APROBADA', 'RECHAZADA', 'CANCELADA') NOT NULL,
    `decidedById` INTEGER NOT NULL,
    `decidedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `comment` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PersonnelHiringConfirmationApproval_hiringConfirmationId_ste_key`(`hiringConfirmationId`, `stepId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_personnelRequisitionId_fkey` FOREIGN KEY (`personnelRequisitionId`) REFERENCES `PersonnelRequisition`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelRequisitionApproval` ADD CONSTRAINT `PersonnelRequisitionApproval_requisitionId_fkey` FOREIGN KEY (`requisitionId`) REFERENCES `PersonnelRequisition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelRequisitionApproval` ADD CONSTRAINT `PersonnelRequisitionApproval_stepId_fkey` FOREIGN KEY (`stepId`) REFERENCES `RequisitionApprovalStep`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelRequisitionApproval` ADD CONSTRAINT `PersonnelRequisitionApproval_decidedById_fkey` FOREIGN KEY (`decidedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelHiringConfirmation` ADD CONSTRAINT `PersonnelHiringConfirmation_requisitionId_fkey` FOREIGN KEY (`requisitionId`) REFERENCES `PersonnelRequisition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelHiringConfirmation` ADD CONSTRAINT `PersonnelHiringConfirmation_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelHiringConfirmationApproval` ADD CONSTRAINT `PersonnelHiringConfirmationApproval_hiringConfirmationId_fkey` FOREIGN KEY (`hiringConfirmationId`) REFERENCES `PersonnelHiringConfirmation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelHiringConfirmationApproval` ADD CONSTRAINT `PersonnelHiringConfirmationApproval_stepId_fkey` FOREIGN KEY (`stepId`) REFERENCES `HiringConfirmationApprovalStep`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelHiringConfirmationApproval` ADD CONSTRAINT `PersonnelHiringConfirmationApproval_decidedById_fkey` FOREIGN KEY (`decidedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

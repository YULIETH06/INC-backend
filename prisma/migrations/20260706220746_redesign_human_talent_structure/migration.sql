/*
  Warnings:

  - You are about to drop the column `stepId` on the `personnelhiringconfirmationapproval` table. All the data in the column will be lost.
  - You are about to drop the column `stepId` on the `personnelrequisitionapproval` table. All the data in the column will be lost.
  - The values [JEFE_AREA,JEFE_DEPARTAMENTO,GERENTE_GENERAL,ANALISTA_TALENTO_HUMANO,JEFE_TALENTO_HUMANO] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `hiringconfirmationapprovalstep` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `requisitionapprovalstep` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[hiringConfirmationId,approvalOrder]` on the table `PersonnelHiringConfirmationApproval` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[requisitionId,approvalOrder]` on the table `PersonnelRequisitionApproval` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `approvalOrder` to the `PersonnelHiringConfirmationApproval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `approverPositionId` to the `PersonnelHiringConfirmationApproval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `approvalOrder` to the `PersonnelRequisitionApproval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `approverPositionId` to the `PersonnelRequisitionApproval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `personnelhiringconfirmationapproval` DROP FOREIGN KEY `PersonnelHiringConfirmationApproval_decidedById_fkey`;

-- DropForeignKey
ALTER TABLE `personnelhiringconfirmationapproval` DROP FOREIGN KEY `PersonnelHiringConfirmationApproval_hiringConfirmationId_fkey`;

-- DropForeignKey
ALTER TABLE `personnelhiringconfirmationapproval` DROP FOREIGN KEY `PersonnelHiringConfirmationApproval_stepId_fkey`;

-- DropForeignKey
ALTER TABLE `personnelrequisitionapproval` DROP FOREIGN KEY `PersonnelRequisitionApproval_decidedById_fkey`;

-- DropForeignKey
ALTER TABLE `personnelrequisitionapproval` DROP FOREIGN KEY `PersonnelRequisitionApproval_requisitionId_fkey`;

-- DropForeignKey
ALTER TABLE `personnelrequisitionapproval` DROP FOREIGN KEY `PersonnelRequisitionApproval_stepId_fkey`;

-- DropIndex
DROP INDEX `PersonnelHiringConfirmationApproval_decidedById_fkey` ON `personnelhiringconfirmationapproval`;

-- DropIndex
DROP INDEX `PersonnelHiringConfirmationApproval_hiringConfirmationId_ste_key` ON `personnelhiringconfirmationapproval`;

-- DropIndex
DROP INDEX `PersonnelHiringConfirmationApproval_stepId_fkey` ON `personnelhiringconfirmationapproval`;

-- DropIndex
DROP INDEX `PersonnelRequisitionApproval_decidedById_fkey` ON `personnelrequisitionapproval`;

-- DropIndex
DROP INDEX `PersonnelRequisitionApproval_requisitionId_stepId_key` ON `personnelrequisitionapproval`;

-- DropIndex
DROP INDEX `PersonnelRequisitionApproval_stepId_fkey` ON `personnelrequisitionapproval`;

-- AlterTable
ALTER TABLE `department` ADD COLUMN `parentDepartmentId` INTEGER NULL,
    ADD COLUMN `responsiblePositionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `personnelhiringconfirmation` ADD COLUMN `status` ENUM('PENDIENTE_APROBACION', 'APROBADA', 'RECHAZADA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE_APROBACION';

-- AlterTable
ALTER TABLE `personnelhiringconfirmationapproval` DROP COLUMN `stepId`,
    ADD COLUMN `approvalOrder` INTEGER NOT NULL,
    ADD COLUMN `approverAssignmentId` INTEGER NULL,
    ADD COLUMN `approverPositionId` INTEGER NOT NULL,
    ADD COLUMN `approverUserId` INTEGER NULL,
    ADD COLUMN `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `isCurrent` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `decision` ENUM('APROBADA', 'RECHAZADA', 'CANCELADA') NULL,
    MODIFY `decidedById` INTEGER NULL,
    MODIFY `decidedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `personnelrequisition` ADD COLUMN `status` ENUM('PENDIENTE_APROBACION', 'EN_APROBACION', 'PENDIENTE_CONFIRMACION_TALENTO_HUMANO', 'PENDIENTE_APROBACION_TALENTO_HUMANO', 'APROBADA', 'RECHAZADA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE_APROBACION';

-- AlterTable
ALTER TABLE `personnelrequisitionapproval` DROP COLUMN `stepId`,
    ADD COLUMN `approvalOrder` INTEGER NOT NULL,
    ADD COLUMN `approverAssignmentId` INTEGER NULL,
    ADD COLUMN `approverPositionId` INTEGER NOT NULL,
    ADD COLUMN `approverUserId` INTEGER NULL,
    ADD COLUMN `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `departmentId` INTEGER NULL,
    ADD COLUMN `isCurrent` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `decision` ENUM('APROBADA', 'RECHAZADA', 'CANCELADA') NULL,
    MODIFY `decidedById` INTEGER NULL,
    MODIFY `decidedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `positionprofile` ADD COLUMN `homeDepartmentId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `role` ENUM('USER', 'ADMIN', 'AGENT') NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE `hiringconfirmationapprovalstep`;

-- DropTable
DROP TABLE `requisitionapprovalstep`;

-- CreateTable
CREATE TABLE `UserPositionAssignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `positionId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserPositionAssignment_userId_idx`(`userId`),
    INDEX `UserPositionAssignment_positionId_idx`(`positionId`),
    INDEX `UserPositionAssignment_isActive_idx`(`isActive`),
    INDEX `UserPositionAssignment_positionId_isActive_idx`(`positionId`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HumanTalentWorkflowConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `analystPositionId` INTEGER NOT NULL,
    `chiefPositionId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HumanTalentWorkflowConfig_analystPositionId_idx`(`analystPositionId`),
    INDEX `HumanTalentWorkflowConfig_chiefPositionId_idx`(`chiefPositionId`),
    INDEX `HumanTalentWorkflowConfig_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Department_parentDepartmentId_idx` ON `Department`(`parentDepartmentId`);

-- CreateIndex
CREATE INDEX `Department_responsiblePositionId_idx` ON `Department`(`responsiblePositionId`);

-- CreateIndex
CREATE INDEX `PersonnelHiringConfirmation_status_idx` ON `PersonnelHiringConfirmation`(`status`);

-- CreateIndex
CREATE INDEX `PersonnelHiringConfirmationApproval_hiringConfirmationId_idx` ON `PersonnelHiringConfirmationApproval`(`hiringConfirmationId`);

-- CreateIndex
CREATE INDEX `PersonnelHiringConfirmationApproval_approverPositionId_idx` ON `PersonnelHiringConfirmationApproval`(`approverPositionId`);

-- CreateIndex
CREATE INDEX `PersonnelHiringConfirmationApproval_approverAssignmentId_idx` ON `PersonnelHiringConfirmationApproval`(`approverAssignmentId`);

-- CreateIndex
CREATE INDEX `PersonnelHiringConfirmationApproval_approverUserId_idx` ON `PersonnelHiringConfirmationApproval`(`approverUserId`);

-- CreateIndex
CREATE INDEX `PersonnelHiringConfirmationApproval_decision_idx` ON `PersonnelHiringConfirmationApproval`(`decision`);

-- CreateIndex
CREATE INDEX `PersonnelHiringConfirmationApproval_isCurrent_idx` ON `PersonnelHiringConfirmationApproval`(`isCurrent`);

-- CreateIndex
CREATE UNIQUE INDEX `PersonnelHiringConfirmationApproval_hiringConfirmationId_app_key` ON `PersonnelHiringConfirmationApproval`(`hiringConfirmationId`, `approvalOrder`);

-- CreateIndex
CREATE INDEX `PersonnelRequisition_status_idx` ON `PersonnelRequisition`(`status`);

-- CreateIndex
CREATE INDEX `PersonnelRequisitionApproval_requisitionId_idx` ON `PersonnelRequisitionApproval`(`requisitionId`);

-- CreateIndex
CREATE INDEX `PersonnelRequisitionApproval_departmentId_idx` ON `PersonnelRequisitionApproval`(`departmentId`);

-- CreateIndex
CREATE INDEX `PersonnelRequisitionApproval_approverPositionId_idx` ON `PersonnelRequisitionApproval`(`approverPositionId`);

-- CreateIndex
CREATE INDEX `PersonnelRequisitionApproval_approverAssignmentId_idx` ON `PersonnelRequisitionApproval`(`approverAssignmentId`);

-- CreateIndex
CREATE INDEX `PersonnelRequisitionApproval_approverUserId_idx` ON `PersonnelRequisitionApproval`(`approverUserId`);

-- CreateIndex
CREATE INDEX `PersonnelRequisitionApproval_decision_idx` ON `PersonnelRequisitionApproval`(`decision`);

-- CreateIndex
CREATE INDEX `PersonnelRequisitionApproval_isCurrent_idx` ON `PersonnelRequisitionApproval`(`isCurrent`);

-- CreateIndex
CREATE UNIQUE INDEX `PersonnelRequisitionApproval_requisitionId_approvalOrder_key` ON `PersonnelRequisitionApproval`(`requisitionId`, `approvalOrder`);

-- CreateIndex
CREATE INDEX `PositionProfile_homeDepartmentId_idx` ON `PositionProfile`(`homeDepartmentId`);

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_parentDepartmentId_fkey` FOREIGN KEY (`parentDepartmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_responsiblePositionId_fkey` FOREIGN KEY (`responsiblePositionId`) REFERENCES `PositionProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PositionProfile` ADD CONSTRAINT `PositionProfile_homeDepartmentId_fkey` FOREIGN KEY (`homeDepartmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPositionAssignment` ADD CONSTRAINT `UserPositionAssignment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPositionAssignment` ADD CONSTRAINT `UserPositionAssignment_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `PositionProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelRequisitionApproval` ADD CONSTRAINT `PersonnelRequisitionApproval_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelRequisitionApproval` ADD CONSTRAINT `PersonnelRequisitionApproval_approverPositionId_fkey` FOREIGN KEY (`approverPositionId`) REFERENCES `PositionProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelRequisitionApproval` ADD CONSTRAINT `PersonnelRequisitionApproval_approverAssignmentId_fkey` FOREIGN KEY (`approverAssignmentId`) REFERENCES `UserPositionAssignment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelRequisitionApproval` ADD CONSTRAINT `PersonnelRequisitionApproval_approverUserId_fkey` FOREIGN KEY (`approverUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelRequisitionApproval` ADD CONSTRAINT `PersonnelRequisitionApproval_decidedById_fkey` FOREIGN KEY (`decidedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HumanTalentWorkflowConfig` ADD CONSTRAINT `HumanTalentWorkflowConfig_analystPositionId_fkey` FOREIGN KEY (`analystPositionId`) REFERENCES `PositionProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HumanTalentWorkflowConfig` ADD CONSTRAINT `HumanTalentWorkflowConfig_chiefPositionId_fkey` FOREIGN KEY (`chiefPositionId`) REFERENCES `PositionProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelHiringConfirmationApproval` ADD CONSTRAINT `PersonnelHiringConfirmationApproval_approverPositionId_fkey` FOREIGN KEY (`approverPositionId`) REFERENCES `PositionProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelHiringConfirmationApproval` ADD CONSTRAINT `PersonnelHiringConfirmationApproval_approverAssignmentId_fkey` FOREIGN KEY (`approverAssignmentId`) REFERENCES `UserPositionAssignment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelHiringConfirmationApproval` ADD CONSTRAINT `PersonnelHiringConfirmationApproval_approverUserId_fkey` FOREIGN KEY (`approverUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelHiringConfirmationApproval` ADD CONSTRAINT `PersonnelHiringConfirmationApproval_decidedById_fkey` FOREIGN KEY (`decidedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `Notification_personnelRequisitionId_idx` ON `Notification`(`personnelRequisitionId`);

-- RedefineIndex
CREATE INDEX `Notification_pqrId_idx` ON `Notification`(`pqrId`);

-- RedefineIndex
CREATE INDEX `Notification_userId_idx` ON `Notification`(`userId`);

-- RedefineIndex
CREATE INDEX `PersonnelHiringConfirmation_createdById_idx` ON `PersonnelHiringConfirmation`(`createdById`);

-- RedefineIndex
CREATE INDEX `PersonnelRequisition_cityId_idx` ON `PersonnelRequisition`(`cityId`);

-- RedefineIndex
CREATE INDEX `PersonnelRequisition_createdById_idx` ON `PersonnelRequisition`(`createdById`);

-- RedefineIndex
CREATE INDEX `PersonnelRequisition_departmentId_idx` ON `PersonnelRequisition`(`departmentId`);

-- RedefineIndex
CREATE INDEX `PersonnelRequisition_positionId_idx` ON `PersonnelRequisition`(`positionId`);

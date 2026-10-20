-- AlterTable
ALTER TABLE `PersonnelRequisition` ADD COLUMN `ownerPositionId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `PersonnelRequisition_ownerPositionId_idx` ON `PersonnelRequisition`(`ownerPositionId`);

-- AddForeignKey
ALTER TABLE `PersonnelRequisition` ADD CONSTRAINT `PersonnelRequisition_ownerPositionId_fkey` FOREIGN KEY (`ownerPositionId`) REFERENCES `PositionProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Rellena el cargo responsable de las requisiciones existentes
-- con el cargo autorizado que hoy tiene activo su creador.
UPDATE `PersonnelRequisition` AS `r`
INNER JOIN `UserPositionAssignment` AS `a`
    ON `a`.`userId` = `r`.`createdById`
    AND `a`.`isActive` = 1
    AND `a`.`endDate` IS NULL
INNER JOIN `PositionProfile` AS `p`
    ON `p`.`id` = `a`.`positionId`
SET `r`.`ownerPositionId` = `a`.`positionId`
WHERE `r`.`ownerPositionId` IS NULL
    AND `p`.`code` IN (
        'SUBGERENTE_GENERAL',
        'DPC-TH-0002',
        'DPC-TH-0008',
        'DPC-TH-0005',
        'DPC-TH-0006',
        'DPC-TH-0009',
        'DPC-TH-0007',
        'DPC-TH-0004',
        'DPC-TH-0132',
        'DPC-TH-0028',
        'DPC-TH-0076',
        'DPC-TH-0073',
        'DPC-TH-0012',
        'DPC-TH-0060',
        'DPC-TH-0059',
        'GERENTE_FINANCIERO',
        'JEFE_CONTABILIDAD',
        'DPC-TH-0033',
        'DPC-TH-0003',
        'DPC-TH-0169'
    );

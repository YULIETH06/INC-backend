-- AlterTable
ALTER TABLE `personnelrequisition` ADD COLUMN `contractDurationMonths` INTEGER NULL,
    ADD COLUMN `contractType` ENUM('DIRECTO', 'TEMPORAL', 'PRACTICANTE') NULL,
    ADD COLUMN `directContractType` ENUM('INDEFINIDO', 'FIJO') NULL,
    ADD COLUMN `internContractType` ENUM('APRENDIZ', 'PASANTE', 'ROTANTE') NULL;

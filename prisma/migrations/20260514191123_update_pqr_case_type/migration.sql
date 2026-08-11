/*
  Warnings:

  - You are about to drop the column `title` on the `pqr` table. All the data in the column will be lost.
  - Added the required column `caseType` to the `PQR` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pqr` DROP COLUMN `title`,
    ADD COLUMN `caseType` ENUM('SAP', 'DANO_EQUIPO', 'INSTALACION', 'OTRO') NOT NULL,
    MODIFY `description` VARCHAR(500) NOT NULL,
    MODIFY `response` VARCHAR(500) NULL;

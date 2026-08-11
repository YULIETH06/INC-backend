/*
  Warnings:

  - The values [RESPONDIDA] on the enum `PQR_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `pqr` MODIFY `status` ENUM('PENDIENTE', 'EN_PROCESO', 'CERRADA') NOT NULL DEFAULT 'PENDIENTE';

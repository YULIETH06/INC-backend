/*
  Warnings:

  - The values [DANO_EQUIPO,INSTALACION,OTRO] on the enum `PQR_caseType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `pqr` MODIFY `caseType` ENUM('SAP', 'BEAS', 'TERMINAL', 'CORREO', 'INTRANET', 'SOPORTE_EQUIPOS', 'SOPORTE_RED', 'MI_PORTAL_SAP', 'LEGALISAPP', 'NUEVAS_SOLICITUDES') NOT NULL;

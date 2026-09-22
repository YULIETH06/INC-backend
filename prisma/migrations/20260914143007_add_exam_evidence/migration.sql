-- AlterTable
ALTER TABLE `personnelcandidatetechnicalevaluation` ADD COLUMN `examEvidenceFileName` VARCHAR(255) NULL,
    ADD COLUMN `examEvidenceFileSize` INTEGER NULL,
    ADD COLUMN `examEvidenceFileUrl` VARCHAR(500) NULL,
    ADD COLUMN `examEvidenceMimeType` VARCHAR(100) NULL,
    ADD COLUMN `examEvidenceOriginalName` VARCHAR(255) NULL,
    ADD COLUMN `examEvidenceUploadedAt` DATETIME(3) NULL;

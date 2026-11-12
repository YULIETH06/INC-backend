-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `actorUserId` INTEGER NULL,
    `actorName` VARCHAR(150) NULL,
    `actorEmail` VARCHAR(150) NULL,
    `actorRole` ENUM('USER', 'ADMIN', 'AGENT') NULL,
    `module` VARCHAR(50) NOT NULL,
    `action` VARCHAR(80) NOT NULL,
    `entityType` VARCHAR(80) NOT NULL,
    `entityId` INTEGER NULL,
    `description` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_actorUserId_idx`(`actorUserId`),
    INDEX `AuditLog_module_idx`(`module`),
    INDEX `AuditLog_action_idx`(`action`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

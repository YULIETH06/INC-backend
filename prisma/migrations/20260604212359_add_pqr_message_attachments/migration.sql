-- AlterTable
ALTER TABLE `pqrmessage` MODIFY `content` VARCHAR(1000) NULL;

-- CreateTable
CREATE TABLE `PqrMessageAttachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileType` ENUM('IMAGE', 'DOCUMENT') NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `messageId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PqrMessageAttachment` ADD CONSTRAINT `PqrMessageAttachment_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `PqrMessage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

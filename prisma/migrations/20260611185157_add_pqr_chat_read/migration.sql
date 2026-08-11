-- CreateTable
CREATE TABLE `PqrChatRead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pqrId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `lastReadAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PqrChatRead_pqrId_userId_key`(`pqrId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PqrChatRead` ADD CONSTRAINT `PqrChatRead_pqrId_fkey` FOREIGN KEY (`pqrId`) REFERENCES `PQR`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PqrChatRead` ADD CONSTRAINT `PqrChatRead_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

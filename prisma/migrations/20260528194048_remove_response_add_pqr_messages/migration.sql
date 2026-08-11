/*
  Warnings:

  - You are about to drop the column `response` on the `pqr` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `pqr` DROP COLUMN `response`;

-- CreateTable
CREATE TABLE `PqrMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(1000) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pqrId` INTEGER NOT NULL,
    `senderId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PqrMessage` ADD CONSTRAINT `PqrMessage_pqrId_fkey` FOREIGN KEY (`pqrId`) REFERENCES `PQR`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PqrMessage` ADD CONSTRAINT `PqrMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

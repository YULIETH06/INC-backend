/*
  Warnings:

  - A unique constraint covering the columns `[activeEmail]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `user`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `activeEmail` VARCHAR(191) NULL,
    ADD COLUMN `deactivatedAt` DATETIME(3) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- Los usuarios existentes están activos: su correo activo es su correo.
UPDATE `user` SET `activeEmail` = `email`;

-- CreateIndex
CREATE UNIQUE INDEX `User_activeEmail_key` ON `User`(`activeEmail`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- CreateIndex
CREATE INDEX `User_isActive_idx` ON `User`(`isActive`);

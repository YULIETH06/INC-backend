/*
  Warnings:

  - You are about to alter the column `content` on the `pqrmessage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(1000)` to `VarChar(500)`.

*/
-- AlterTable
ALTER TABLE `pqrmessage` MODIFY `content` VARCHAR(500) NULL;

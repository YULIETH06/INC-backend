/*
  Warnings:

  - The values [NEW_MESSAGE] on the enum `Notification_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `notification` MODIFY `type` ENUM('NEW_PQR', 'STATUS_CHANGE', 'PRIORITY_CHANGE', 'PQR_CLOSED', 'PQR_RATED', 'PQR_TAKEN') NOT NULL;

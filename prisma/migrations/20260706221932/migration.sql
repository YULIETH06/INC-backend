-- AddForeignKey
ALTER TABLE `PersonnelRequisitionApproval` ADD CONSTRAINT `PersonnelRequisitionApproval_requisitionId_fkey` FOREIGN KEY (`requisitionId`) REFERENCES `PersonnelRequisition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonnelHiringConfirmationApproval` ADD CONSTRAINT `PersonnelHiringConfirmationApproval_hiringConfirmationId_fkey` FOREIGN KEY (`hiringConfirmationId`) REFERENCES `PersonnelHiringConfirmation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

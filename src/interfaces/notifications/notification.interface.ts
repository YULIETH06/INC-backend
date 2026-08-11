import type { NotificationType } from "@prisma/client";

export interface CreateNotificationData {
  title: string;
  message: string;
  type: NotificationType;
  userId: number;
  pqrId?: number;
  personnelRequisitionId?: number;
}
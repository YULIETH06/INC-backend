import { PqrCaseType } from "@prisma/client";

// Datos necesarios para crear una nueva PQR.
export interface CreatePqrData {
  caseType: PqrCaseType;
  description: string;
  userId: number;
  file?: Express.Multer.File | undefined;
}

// Datos necesarios para calificar una PQR.
export interface RatePqrData {
  rating: number;
  ratingComment?: string;
}
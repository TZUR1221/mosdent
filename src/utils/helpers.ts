import { ApiResponse } from '../types/index.js';

export const successResponse = <T>(
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200,
): ApiResponse<T> => {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
};

export const errorResponse = (
  message: string = 'An error occurred',
  statusCode: number = 400,
  errors?: Record<string, any>,
): ApiResponse => {
  return {
    success: false,
    statusCode,
    message,
    errors,
  };
};

export const generateNormalizedPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const generateIdHash = (idNumber: string): string => {
  // Simple hash for duplicate detection
  return Buffer.from(idNumber).toString('base64');
};

export const calculatePagination = (page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const start = startDate.toLocaleDateString('he-IL');
  const end = endDate.toLocaleDateString('he-IL');
  return `${start} - ${end}`;
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

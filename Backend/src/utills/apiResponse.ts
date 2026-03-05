import { HttpException, HttpStatus } from '@nestjs/common';

export const apiResponse = (
  success: boolean,
  message: string,
  data?: unknown,
) => {
  return {
    success,
    message,
    data: data ?? null,
  };
};

export const apiError = (
  message: string,
  error?: unknown,
  status: HttpStatus = HttpStatus.BAD_REQUEST,
): never => {
  throw new HttpException(
    {
      success: false,
      message,
      error: error ?? null,
    },
    status,
  );
};
// HttpStatus.OK → 200
// HttpStatus.CREATED → 201
// HttpStatus.BAD_REQUEST → 400
// HttpStatus.UNAUTHORIZED → 401
// HttpStatus.FORBIDDEN → 403
// HttpStatus.NOT_FOUND → 404
// HttpStatus.CONFLICT → 409
// HttpStatus.INTERNAL_SERVER_ERROR → 500

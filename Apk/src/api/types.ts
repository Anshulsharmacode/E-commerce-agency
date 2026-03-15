
export interface ApiResponse<T> {
  message: string;
  data: T;
}


export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

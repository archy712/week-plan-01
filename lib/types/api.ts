export interface ApiError {
  code: string;
  message: string;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

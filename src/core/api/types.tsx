// Tipe generic untuk seluruh response API (single source of truth)

export interface BaseResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  data: T;
}

// Metadata pagination standar dari backend
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Bentuk data untuk endpoint yang ber-pagination
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

// Shortcut: BaseResponse yang membungkus data ber-pagination
export type PaginatedResponse<T> = BaseResponse<PaginatedData<T>>;

// Bentuk body error dari backend (mis. 401/403/400)
export interface ApiErrorResponse {
  success: boolean | string;
  message: string;
  errorCode?: string;
}

// Kode error token yang dikenali interceptor
export const TOKEN_ERROR_CODE = {
  EXPIRED: 'TOKEN_EXPIRED',
  INVALID: 'INVALID_TOKEN',
} as const;

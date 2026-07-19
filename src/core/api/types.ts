// Tipe response standar backend E-Catalogue.

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error?: {
    code: string;
    details: unknown;
  };
}

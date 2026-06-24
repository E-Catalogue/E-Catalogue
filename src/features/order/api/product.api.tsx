import { apiClient } from '@/core/api/client';
import type { BaseResponse, PaginatedData } from '@/core/api/types';
import type { ApiProduct, ProductCategory, ProductListParams } from './product.schema';

export const productApi = {
  // GET /sales/product/paginated?search&page&limit&categoryId&categorySubId (semua param opsional)
  getPaginated: async (params: ProductListParams = {}): Promise<PaginatedData<ApiProduct>> => {
    const response = await apiClient.get<BaseResponse<PaginatedData<ApiProduct>>>(
      '/sales/product/paginated',
      { params }
    );
    return response.data.data;
  },

  // GET /sales/combobox/category
  getCategories: async (): Promise<ProductCategory[]> => {
    const response = await apiClient.get<BaseResponse<ProductCategory[]>>('/sales/combobox/category');
    return response.data.data;
  },

  // GET /sales/product/{id}
  getDetail: async (id: string): Promise<ApiProduct> => {
    const response = await apiClient.get<BaseResponse<ApiProduct>>(`/sales/product/${id}`);
    return response.data.data;
  },
};

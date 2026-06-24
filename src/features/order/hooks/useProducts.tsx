import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product.api';
import { mapApiProductToProduct, type ProductListParams } from '../api/product.schema';

// Daftar produk (paginated). Mengembalikan produk yang sudah dipetakan ke bentuk
// internal Product agar langsung bisa dipakai komponen POS.
export const useProducts = (params: ProductListParams = {}) => {
  const query = useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getPaginated(params),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    products: (query.data?.items ?? []).map(mapApiProductToProduct),
    pagination: query.data?.pagination,
  };
};

// Kategori produk untuk filter tab.
export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: productApi.getCategories,
    staleTime: 1000 * 60 * 5, // kategori jarang berubah
  });
};

// Detail satu produk.
export const useProductDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['product-detail', id],
    queryFn: () => productApi.getDetail(id as string),
    enabled: !!id,
  });
};

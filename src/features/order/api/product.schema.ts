import { z } from 'zod';
import { resolveImageUrl } from '@/core/utils/resolveImageUrl';
import { DEFAULT_PRODUCT_IMAGE } from '@/shared/constants';
import type { Product } from '../schema';

// ===== Schema response dari backend (endpoint /sales/product/*) =====

export const ProductCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
});

export const ProductSubcategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  categoryId: z.string(),
});

// Metadata produk (texture, allergen, dsb) -> ditampilkan sebagai info produk
export const ProductDetailSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
});

// Pilihan/addition value (mis. "Warm", "Room Temperature")
export const ProductOptionValueSchema = z.object({
  id: z.string(),
  optionId: z.string().optional(),
  value: z.string(),
  price: z.number().default(0),
  description: z.string().nullable().optional(),
});

// Grup addition (mis. "serving")
export const ApiProductOptionSchema = z.object({
  id: z.string(),
  key: z.string(),
  description: z.string().nullable().optional(),
  position: z.number().optional(),
  isRequired: z.boolean().optional(),
  optionValues: z.array(ProductOptionValueSchema).default([]),
});

export const ApiProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  imageUrl: z.string().nullable().optional(),
  story: z.string().nullable().optional(),
  categoryId: z.string(),
  subcategoryId: z.string().nullable().optional(),
  category: ProductCategorySchema.nullable().optional(),
  subcategory: ProductSubcategorySchema.nullable().optional(),
  details: z.array(ProductDetailSchema).optional(),
  options: z.array(ApiProductOptionSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ApiProduct = z.infer<typeof ApiProductSchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;

// ===== Query params untuk /sales/product/paginated (semua opsional) =====
export interface ProductListParams {
  search?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  categorySubId?: string;
}

// Ubah key snake_case (mis. "serving_suggestion") jadi label rapi ("Serving Suggestion")
const prettifyKey = (key: string): string =>
  key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

// ===== Mapper: bentuk API -> bentuk internal Product (dipakai komponen POS) =====
export const mapApiProductToProduct = (item: ApiProduct): Product => ({
  id: item.id,
  name: item.name,
  price: item.price,
  categoryId: item.categoryId,
  // Pakai gambar dari API jika ada, selain itu fallback ke gambar default.
  image: resolveImageUrl(item.imageUrl) || DEFAULT_PRODUCT_IMAGE,
  type: 'single',
  description: item.description ?? undefined,
  story: item.story ?? undefined,
  details: (item.details ?? []).map((d) => ({ key: prettifyKey(d.key), value: d.value })),
  // Additions: tiap option -> grup pilihan; optionValues -> choices
  options: (item.options ?? []).map((opt) => ({
    id: opt.id,
    category: prettifyKey(opt.key),
    // Backend belum mengirim flag wajib; default required agar selalu ada pilihan terpilih
    isRequired: opt.isRequired ?? true,
    choices: (opt.optionValues ?? []).map((v) => ({
      id: v.id,
      name: v.value,
      price: v.price,
    })),
  })),
});

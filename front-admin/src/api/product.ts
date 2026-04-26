import request from './request';
import type { PageResult, PageParams, Product, ProductCategory } from '../types';

// ========== 商品 ==========

/** 分页查询商品列表 */
export function getProductPage(params: PageParams) {
  return request.get<PageResult<Product>>('/products/page', { params });
}

/** 获取商品详情 */
export function getProductById(id: number) {
  return request.get<Product>(`/products/${id}`);
}

/** 创建商品 */
export function createProduct(data: Partial<Product>) {
  return request.post<void>('/products', data);
}

/** 更新商品 */
export function updateProduct(id: number, data: Partial<Product>) {
  return request.put<void>(`/products/${id}`, data);
}

/** 删除商品 */
export function deleteProduct(id: number) {
  return request.delete<void>(`/products/${id}`);
}

/** 更新商品库存 */
export function updateProductStock(id: number, stock: number) {
  return request.put<void>(`/products/${id}/stock`, { stock });
}

/** 批量更新商品状态 */
export function batchUpdateProductStatus(ids: number[], status: number) {
  return request.put<void>('/products/batch/status', { ids, status });
}

/** 批量删除商品 */
export function batchDeleteProducts(ids: number[]) {
  return request.delete<void>('/products/batch', { data: ids });
}

/** 批量删除商品分类 */
export function batchDeleteProductCategories(ids: number[]) {
  return request.delete<void>('/products/categories/batch', { data: ids });
}

/** 批量更新商品分类状态 */
export function batchUpdateProductCategoryStatus(ids: number[], status: number) {
  return request.put<void>('/products/categories/batch/status', { ids, status });
}

// ========== 商品分类 ==========

/** 获取商品分类列表（全部） */
export function getProductCategories() {
  return request.get<ProductCategory[]>('/products/categories');
}

/** 分页查询商品分类 */
export function getProductCategoriesPage(params: PageParams) {
  return request.get<PageResult<ProductCategory>>('/products/categories/page', { params });
}

/** 创建商品分类 */
export function createProductCategory(data: Partial<ProductCategory>) {
  return request.post<void>('/products/categories', data);
}

/** 更新商品分类 */
export function updateProductCategory(id: number, data: Partial<ProductCategory>) {
  return request.put<void>(`/products/categories/${id}`, data);
}

/** 删除商品分类 */
export function deleteProductCategory(id: number) {
  return request.delete<void>(`/products/categories/${id}`);
}

/** 更新商品分类状态 */
export function updateProductCategoryStatus(id: number, status: number) {
  return request.put<void>(`/products/categories/${id}/status`, { status });
}

export default {
  getProductPage, getProductById, createProduct, updateProduct,
  deleteProduct, updateProductStock, batchUpdateProductStatus, batchDeleteProducts,
  getProductCategories, getProductCategoriesPage,
  createProductCategory, updateProductCategory, deleteProductCategory,
  updateProductCategoryStatus, batchDeleteProductCategories, batchUpdateProductCategoryStatus,
};

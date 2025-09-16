package com.cinema.booking.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.CategoryDTO;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.dto.ProductDTO;

import java.util.List;

/**
 * 商品服务接口
 */
public interface ProductService {
    
    /**
     * 分页查询商品列表
     * @param pageRequest 分页请求参数
     * @param categoryId 分类ID
     * @param keyword 关键词
     * @param status 状态
     * @param isFeatured 是否推荐
     * @return 商品分页列表
     */
    IPage<ProductDTO> getProductPage(PageRequest pageRequest, Long categoryId, String keyword, Integer status, Boolean isFeatured);
    
    /**
     * 根据ID获取商品详情
     * @param id 商品ID
     * @return 商品详情
     */
    ProductDTO getProductById(Long id);
    
    /**
     * 创建商品
     * @param productDTO 商品信息
     * @return 创建的商品信息
     */
    ProductDTO createProduct(ProductDTO productDTO);
    
    /**
     * 更新商品
     * @param id 商品ID
     * @param productDTO 商品信息
     * @return 更新后的商品信息
     */
    ProductDTO updateProduct(Long id, ProductDTO productDTO);
    
    /**
     * 删除商品
     * @param id 商品ID
     */
    void deleteProduct(Long id);
    
    /**
     * 获取推荐商品列表
     * @param limit 限制数量
     * @return 推荐商品列表
     */
    List<ProductDTO> getFeaturedProducts(Integer limit);
    
    /**
     * 获取热销商品列表
     * @param limit 限制数量
     * @return 热销商品列表
     */
    List<ProductDTO> getHotProducts(Integer limit);
    
    /**
     * 根据分类ID获取商品列表
     * @param categoryId 分类ID
     * @return 商品列表
     */
    List<ProductDTO> getProductsByCategory(Long categoryId);
    
    /**
     * 更新商品库存
     * @param productId 商品ID
     * @param quantity 变更数量（可为负数）
     * @return 是否更新成功
     */
    boolean updateStock(Long productId, Integer quantity);
    
    /**
     * 增加商品销量
     * @param productId 商品ID
     * @param quantity 数量
     */
    void incrementSalesCount(Long productId, Integer quantity);
    
    /**
     * 获取商品分类列表
     * @return 分类列表
     */
    List<CategoryDTO> getProductCategories();
    
    /**
     * 创建商品分类
     * @param categoryDTO 分类信息
     * @return 创建的分类信息
     */
    CategoryDTO createProductCategory(CategoryDTO categoryDTO);
    
    /**
     * 更新商品分类
     * @param id 分类ID
     * @param categoryDTO 分类信息
     * @return 更新后的分类信息
     */
    CategoryDTO updateProductCategory(Long id, CategoryDTO categoryDTO);
    
    /**
     * 删除商品分类
     * @param id 分类ID
     */
    void deleteProductCategory(Long id);
    
    /**
     * 分页查询商品分类列表
     * @param current 当前页码
     * @param size 每页大小
     * @param keyword 关键词
     * @param status 状态
     * @return 分类分页列表
     */
    Object getProductCategoriesPage(Integer current, Integer size, String keyword, Integer status);
    
    /**
     * 更新商品分类状态
     * @param id 分类ID
     * @param status 状态
     */
    void updateProductCategoryStatus(Long id, Integer status);
}

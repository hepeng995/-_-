package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.entity.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 商品Mapper接口
 */
@Mapper
public interface ProductMapper extends BaseMapper<Product> {
    
    /**
     * 分页查询商品列表
     * @param page 分页参数
     * @param categoryId 分类ID
     * @param keyword 关键词
     * @param status 状态
     * @param isFeatured 是否推荐
     * @return 商品分页列表
     */
    IPage<Product> selectProductPage(Page<Product> page, 
                                   @Param("categoryId") Long categoryId,
                                   @Param("keyword") String keyword,
                                   @Param("status") Integer status,
                                   @Param("isFeatured") Boolean isFeatured);
    
    /**
     * 获取推荐商品列表
     * @param limit 限制数量
     * @return 推荐商品列表
     */
    List<Product> selectFeaturedProducts(@Param("limit") Integer limit);
    
    /**
     * 获取热销商品列表
     * @param limit 限制数量
     * @return 热销商品列表
     */
    List<Product> selectHotProducts(@Param("limit") Integer limit);
    
    /**
     * 根据分类ID查询商品列表
     * @param categoryId 分类ID
     * @return 商品列表
     */
    List<Product> selectByCategoryId(@Param("categoryId") Long categoryId);
    
    /**
     * 更新库存数量
     * @param productId 商品ID
     * @param quantity 数量（可为负数）
     * @return 更新行数
     */
    int updateStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);
    
    /**
     * 增加销量
     * @param productId 商品ID
     * @param quantity 数量
     */
    void incrementSalesCount(@Param("productId") Long productId, @Param("quantity") Integer quantity);
}

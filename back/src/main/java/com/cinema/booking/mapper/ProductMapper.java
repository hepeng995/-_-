package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.entity.Product;
import com.cinema.booking.entity.ProductWithReviewStats;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

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

    @Select("""
        SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.origin,
            p.avg_rating AS avgRating,
            p.review_count AS reviewCount,
            COUNT(CASE WHEN pr.rating >= 4 THEN 1 END) AS goodReviewCount,
            SUBSTRING(MAX(pr.content), 1, 100) AS topReview
        FROM products p
        LEFT JOIN product_reviews pr ON p.id = pr.product_id 
            AND pr.rating >= 4 
            AND pr.status = 1 
            AND pr.deleted = 0
        WHERE p.deleted = 0 
          AND p.status = 1
          AND (p.name LIKE CONCAT('%', #{keyword}, '%') 
               OR p.description LIKE CONCAT('%', #{keyword}, '%'))
        GROUP BY p.id
        HAVING goodReviewCount > 0
        ORDER BY p.avg_rating DESC, goodReviewCount DESC
        LIMIT 5
        """)
    List<ProductWithReviewStats> selectProductsWithGoodReviews(@Param("keyword") String keyword);
}

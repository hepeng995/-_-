package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.ProductReviewDTO;
import com.cinema.booking.dto.ReviewQueryDTO;
import com.cinema.booking.entity.ProductReview;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 商品评价Mapper接口
 */
@Mapper
public interface ProductReviewMapper extends BaseMapper<ProductReview> {
    
    /**
     * 分页查询评价列表
     */
    IPage<ProductReviewDTO> selectReviewPage(Page<ProductReviewDTO> page, @Param("query") ReviewQueryDTO query, @Param("currentUserId") Long currentUserId);
    
    /**
     * 根据ID查询评价详情
     */
    ProductReviewDTO selectReviewById(@Param("id") Long id, @Param("currentUserId") Long currentUserId);
    
    /**
     * 查询商品评价统计信息
     */
    Map<String, Object> selectReviewStats(@Param("productId") Long productId);
    
    /**
     * 查询用户是否已评价某商品
     */
    Integer checkUserReviewed(@Param("userId") Long userId, @Param("productId") Long productId, @Param("orderId") Long orderId);
    
    /**
     * 更新评价有用数
     */
    void updateHelpfulCount(@Param("reviewId") Long reviewId, @Param("increment") Integer increment);
    
    /**
     * 查询商品的评价分布
     */
    List<Map<String, Object>> selectRatingDistribution(@Param("productId") Long productId);
}

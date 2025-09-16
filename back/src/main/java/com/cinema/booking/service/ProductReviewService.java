package com.cinema.booking.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.ProductReviewDTO;
import com.cinema.booking.dto.ReviewQueryDTO;
import com.cinema.booking.dto.ReviewReplyDTO;

import java.util.List;
import java.util.Map;

/**
 * 商品评价服务接口
 */
public interface ProductReviewService {
    
    /**
     * 创建评价
     * @param reviewDTO 评价信息
     * @return 创建的评价信息
     */
    ProductReviewDTO createReview(ProductReviewDTO reviewDTO);
    
    /**
     * 分页查询评价列表
     * @param queryDTO 查询条件
     * @param currentUserId 当前用户ID
     * @return 评价分页列表
     */
    IPage<ProductReviewDTO> getReviewPage(ReviewQueryDTO queryDTO, Long currentUserId);
    
    /**
     * 根据ID获取评价详情
     * @param id 评价ID
     * @param currentUserId 当前用户ID
     * @return 评价详情
     */
    ProductReviewDTO getReviewById(Long id, Long currentUserId);
    
    /**
     * 更新评价
     * @param id 评价ID
     * @param reviewDTO 评价信息
     * @return 更新后的评价信息
     */
    ProductReviewDTO updateReview(Long id, ProductReviewDTO reviewDTO);
    
    /**
     * 删除评价
     * @param id 评价ID
     * @param userId 用户ID（用于权限验证）
     */
    void deleteReview(Long id, Long userId);
    
    /**
     * 商家回复评价
     * @param replyDTO 回复信息
     */
    void replyReview(ReviewReplyDTO replyDTO);
    
    /**
     * 点赞/取消点赞评价
     * @param reviewId 评价ID
     * @param userId 用户ID
     * @return 是否点赞成功
     */
    boolean toggleHelpful(Long reviewId, Long userId);
    
    /**
     * 获取商品评价统计信息
     * @param productId 商品ID
     * @return 统计信息
     */
    Map<String, Object> getReviewStats(Long productId);
    
    /**
     * 获取商品评价分布
     * @param productId 商品ID
     * @return 评价分布
     */
    List<Map<String, Object>> getRatingDistribution(Long productId);
    
    /**
     * 检查用户是否已评价某商品
     * @param userId 用户ID
     * @param productId 商品ID
     * @param orderId 订单ID（可选）
     * @return 是否已评价
     */
    boolean hasUserReviewed(Long userId, Long productId, Long orderId);
    
    /**
     * 审核评价
     * @param reviewId 评价ID
     * @param status 审核状态：1-通过，2-拒绝
     */
    void auditReview(Long reviewId, Integer status);
    
    /**
     * 批量审核评价
     * @param reviewIds 评价ID列表
     * @param status 审核状态：1-通过，2-拒绝
     */
    void batchAuditReviews(List<Long> reviewIds, Integer status);
    
    /**
     * 获取用户的评价列表
     * @param userId 用户ID
     * @param current 当前页
     * @param size 每页大小
     * @return 用户评价列表
     */
    IPage<ProductReviewDTO> getUserReviews(Long userId, Long current, Long size);
}

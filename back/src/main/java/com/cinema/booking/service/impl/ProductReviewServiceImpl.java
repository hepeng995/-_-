package com.cinema.booking.service.impl;


import com.cinema.booking.utils.HtmlSanitizer;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.ProductReviewDTO;
import com.cinema.booking.dto.ReviewQueryDTO;
import com.cinema.booking.dto.ReviewReplyDTO;
import com.cinema.booking.entity.ProductReview;
import com.cinema.booking.entity.ReviewHelpful;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.ProductReviewMapper;
import com.cinema.booking.mapper.ReviewHelpfulMapper;
import com.cinema.booking.mapper.OrderMapper;
import com.cinema.booking.security.SecurityService;
import com.cinema.booking.service.ProductReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 商品评价服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductReviewServiceImpl implements ProductReviewService {

    private final ProductReviewMapper productReviewMapper;
    private final ReviewHelpfulMapper reviewHelpfulMapper;
    private final ProductReviewStatsService productReviewStatsService;
    private final SecurityService securityService;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public ProductReviewDTO createReview(ProductReviewDTO reviewDTO) {
        Long orderId = resolveReviewableOrderId(reviewDTO.getUserId(), reviewDTO.getProductId(), reviewDTO.getOrderId());
        reviewDTO.setOrderId(orderId);

        if (Boolean.TRUE.equals(hasReviewedOrderProduct(reviewDTO.getUserId(), reviewDTO.getProductId(), orderId))) {
            throw new ServiceException("该订单中的商品已经评价过了");
        }

        // 构建评价实体
        ProductReview review = ProductReview.builder()
                .productId(reviewDTO.getProductId())
                .userId(reviewDTO.getUserId())
                .orderId(orderId)
                .rating(reviewDTO.getRating())
                .content(HtmlSanitizer.cleanRich(reviewDTO.getContent()))
                .images(reviewDTO.getImages())
                .isAnonymous(reviewDTO.getIsAnonymous() != null ? reviewDTO.getIsAnonymous() : false)
                .status(1) // 默认通过审核
                .helpfulCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .deleted(false)
                .build();

        // 保存评价
        productReviewMapper.insert(review);

        // 更新商品评价统计信息
        productReviewStatsService.updateProductReviewStats(reviewDTO.getProductId());

        // 返回创建的评价信息
        return getReviewById(review.getId(), reviewDTO.getUserId());
    }

    private Long resolveReviewableOrderId(Long userId, Long productId, Long orderId) {
        if (userId == null || productId == null) {
            throw new ServiceException("评价信息不完整");
        }

        if (orderId != null) {
            Integer count = orderMapper.countCompletedOrderItemsForReview(userId, productId, orderId);
            if (count == null || count <= 0) {
                throw new ServiceException("该订单中的商品不可评价，请确认订单已完成");
            }
            return orderId;
        }

        Long resolvedOrderId = orderMapper.selectLatestReviewableOrderId(userId, productId);
        if (resolvedOrderId == null) {
            throw new ServiceException("未找到可评价的已完成订单");
        }
        return resolvedOrderId;
    }

    private Boolean hasReviewedOrderProduct(Long userId, Long productId, Long orderId) {
        Integer count = productReviewMapper.checkUserReviewed(userId, productId, orderId);
        return count != null && count > 0;
    }

    @Override
    public IPage<ProductReviewDTO> getReviewPage(ReviewQueryDTO queryDTO, Long currentUserId) {
        Page<ProductReviewDTO> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        return productReviewMapper.selectReviewPage(page, queryDTO, currentUserId);
    }

    @Override
    public ProductReviewDTO getReviewById(Long id, Long currentUserId) {
        ProductReviewDTO review = productReviewMapper.selectReviewById(id, currentUserId);
        if (review == null) {
            throw new ServiceException("评价不存在");
        }
        return review;
    }

    @Override
    @Transactional
    public ProductReviewDTO updateReview(Long id, ProductReviewDTO reviewDTO) {
        // 查询原评价
        ProductReview existingReview = productReviewMapper.selectById(id);
        if (existingReview == null || existingReview.getDeleted()) {
            throw new ServiceException("评价不存在");
        }

        // 验证权限（只能修改自己的评价）
        Long currentUserId = securityService.getCurrentUserId();
        if (!existingReview.getUserId().equals(currentUserId)) {
            throw new ServiceException("无权限修改此评价");
        }

        // 更新评价信息
        LambdaUpdateWrapper<ProductReview> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(ProductReview::getId, id)
                .set(ProductReview::getRating, reviewDTO.getRating())
                .set(ProductReview::getContent, reviewDTO.getContent())
                .set(ProductReview::getImages, reviewDTO.getImages())
                .set(ProductReview::getIsAnonymous, reviewDTO.getIsAnonymous())
                .set(ProductReview::getUpdatedAt, LocalDateTime.now());

        productReviewMapper.update(null, updateWrapper);

        // 更新商品评价统计信息
        ProductReview updatedReview = productReviewMapper.selectById(id);
        if (updatedReview != null) {
            productReviewStatsService.updateProductReviewStats(updatedReview.getProductId());
        }

        return getReviewById(id, currentUserId);
    }

    @Override
    @Transactional
    public void deleteReview(Long id, Long userId) {
        // 查询评价
        ProductReview review = productReviewMapper.selectById(id);
        if (review == null || review.getDeleted()) {
            throw new ServiceException("评价不存在");
        }

        // 验证权限
        if (!review.getUserId().equals(userId)) {
            throw new ServiceException("无权限删除此评价");
        }

        // 逻辑删除
        LambdaUpdateWrapper<ProductReview> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(ProductReview::getId, id)
                .set(ProductReview::getDeleted, true)
                .set(ProductReview::getUpdatedAt, LocalDateTime.now());

        productReviewMapper.update(null, updateWrapper);

        // 更新商品评价统计信息
        productReviewStatsService.updateProductReviewStats(review.getProductId());
    }

    @Override
    @Transactional
    public void replyReview(ReviewReplyDTO replyDTO) {
        // 更新回复内容
        LambdaUpdateWrapper<ProductReview> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(ProductReview::getId, replyDTO.getReviewId())
                .set(ProductReview::getReplyContent, replyDTO.getReplyContent())
                .set(ProductReview::getReplyTime, LocalDateTime.now())
                .set(ProductReview::getUpdatedAt, LocalDateTime.now());

        int updated = productReviewMapper.update(null, updateWrapper);
        if (updated == 0) {
            throw new ServiceException("评价不存在或已删除");
        }
    }

    @Override
    @Transactional
    public boolean toggleHelpful(Long reviewId, Long userId) {
        // 检查是否已点赞
        Integer helpfulCount = reviewHelpfulMapper.checkUserHelpful(userId, reviewId);
        
        if (helpfulCount > 0) {
            // 已点赞，取消点赞
            reviewHelpfulMapper.deleteUserHelpful(userId, reviewId);
            productReviewMapper.updateHelpfulCount(reviewId, -1);
            return false;
        } else {
            // 未点赞，添加点赞
            ReviewHelpful helpful = ReviewHelpful.builder()
                    .reviewId(reviewId)
                    .userId(userId)
                    .createdAt(LocalDateTime.now())
                    .build();
            reviewHelpfulMapper.insert(helpful);
            productReviewMapper.updateHelpfulCount(reviewId, 1);
            return true;
        }
    }

    @Override
    public Map<String, Object> getReviewStats(Long productId) {
        return productReviewMapper.selectReviewStats(productId);
    }

    @Override
    public List<Map<String, Object>> getRatingDistribution(Long productId) {
        return productReviewMapper.selectRatingDistribution(productId);
    }

    @Override
    public boolean hasUserReviewed(Long userId, Long productId, Long orderId) {
        Integer count = productReviewMapper.checkUserReviewed(userId, productId, orderId);
        return count > 0;
    }

    @Override
    @Transactional
    public void auditReview(Long reviewId, Integer status) {
        LambdaUpdateWrapper<ProductReview> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(ProductReview::getId, reviewId)
                .set(ProductReview::getStatus, status)
                .set(ProductReview::getUpdatedAt, LocalDateTime.now());

        int updated = productReviewMapper.update(null, updateWrapper);
        if (updated == 0) {
            throw new ServiceException("评价不存在");
        }

        // 获取评价信息并更新商品统计
        ProductReview review = productReviewMapper.selectById(reviewId);
        if (review != null) {
            productReviewStatsService.updateProductReviewStats(review.getProductId());
        }
    }

    @Override
    @Transactional
    public void batchAuditReviews(List<Long> reviewIds, Integer status) {
        LambdaUpdateWrapper<ProductReview> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.in(ProductReview::getId, reviewIds)
                .set(ProductReview::getStatus, status)
                .set(ProductReview::getUpdatedAt, LocalDateTime.now());

        productReviewMapper.update(null, updateWrapper);
    }

    @Override
    public IPage<ProductReviewDTO> getUserReviews(Long userId, Long current, Long size) {
        ReviewQueryDTO queryDTO = new ReviewQueryDTO();
        queryDTO.setUserId(userId);
        queryDTO.setCurrent(current);
        queryDTO.setSize(size);
        queryDTO.setSortBy("time");
        queryDTO.setSortOrder("desc");

        return getReviewPage(queryDTO, userId);
    }
}

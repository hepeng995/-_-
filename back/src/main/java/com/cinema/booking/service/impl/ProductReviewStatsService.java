package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.cinema.booking.entity.Product;
import com.cinema.booking.mapper.ProductMapper;
import com.cinema.booking.mapper.ProductReviewMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 商品评价统计服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductReviewStatsService {

    private final ProductMapper productMapper;
    private final ProductReviewMapper productReviewMapper;

    /**
     * 更新商品评价统计信息
     */
    public void updateProductReviewStats(Long productId) {
        try {
            // 获取评价统计信息
            Map<String, Object> stats = productReviewMapper.selectReviewStats(productId);
            
            Integer totalCount = (Integer) stats.get("total_count");
            BigDecimal avgRating = (BigDecimal) stats.get("avg_rating");
            
            // 更新商品表的统计信息
            LambdaUpdateWrapper<Product> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.eq(Product::getId, productId)
                    .set(Product::getReviewCount, totalCount)
                    .set(Product::getAvgRating, avgRating != null ? avgRating : BigDecimal.ZERO);
            
            productMapper.update(null, updateWrapper);
            
            log.info("Updated product review stats for product {}: count={}, avgRating={}", 
                    productId, totalCount, avgRating);
        } catch (Exception e) {
            log.error("Failed to update product review stats for product {}", productId, e);
        }
    }
}

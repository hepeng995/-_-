package com.cinema.booking.entity;

import lombok.Data;

import java.math.BigDecimal;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.entity
 * @createTime 2026-04-15  15:28
 * @description TODO
 */

@Data
public class ProductWithReviewStats {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String origin;
    private BigDecimal avgRating;
    private Integer reviewCount;
    private Integer goodReviewCount;
    private String topReview;
}

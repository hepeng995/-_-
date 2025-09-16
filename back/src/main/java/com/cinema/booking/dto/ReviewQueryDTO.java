package com.cinema.booking.dto;

import lombok.Data;

/**
 * 评价查询DTO
 */
@Data
public class ReviewQueryDTO {
    
    /**
     * 商品ID
     */
    private Long productId;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 评分筛选
     */
    private Integer rating;
    
    /**
     * 状态筛选
     */
    private Integer status;
    
    /**
     * 是否有图片
     */
    private Boolean hasImages;
    
    /**
     * 排序方式：time-时间排序，helpful-有用数排序，rating-评分排序
     */
    private String sortBy = "time";
    
    /**
     * 排序方向：asc-升序，desc-降序
     */
    private String sortOrder = "desc";
    
    /**
     * 当前页
     */
    private Long current = 1L;
    
    /**
     * 每页大小
     */
    private Long size = 10L;
}

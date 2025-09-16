package com.cinema.booking.dto;

import lombok.Data;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 商品评价DTO
 */
@Data
public class ProductReviewDTO {
    
    private Long id;
    
    /**
     * 商品ID
     */
    @NotNull(message = "商品ID不能为空")
    private Long productId;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 订单ID
     */
    private Long orderId;
    
    /**
     * 评分：1-5星
     */
    @NotNull(message = "评分不能为空")
    @Min(value = 1, message = "评分最少1星")
    @Max(value = 5, message = "评分最多5星")
    private Integer rating;
    
    /**
     * 评价内容
     */
    private String content;
    
    /**
     * 评价图片（JSON数组）
     */
    private String images;
    
    /**
     * 是否匿名评价：0否，1是
     */
    private Boolean isAnonymous;
    
    /**
     * 状态：0待审核，1已通过，2已拒绝
     */
    private Integer status;
    
    /**
     * 商家回复内容
     */
    private String replyContent;
    
    /**
     * 商家回复时间
     */
    private LocalDateTime replyTime;
    
    /**
     * 有用数
     */
    private Integer helpfulCount;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    // 扩展字段
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 用户真实姓名
     */
    private String realName;
    
    /**
     * 用户头像
     */
    private String userAvatar;
    
    /**
     * 商品名称
     */
    private String productName;
    
    /**
     * 商品封面图
     */
    private String productCoverImage;
    
    /**
     * 状态描述
     */
    private String statusDesc;
    
    /**
     * 当前用户是否点赞了该评价
     */
    private Boolean isHelpful;
}

package com.cinema.booking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 商品评价实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("product_reviews")
public class ProductReview {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 商品ID
     */
    @TableField("product_id")
    private Long productId;
    
    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;
    
    /**
     * 订单ID
     */
    @TableField("order_id")
    private Long orderId;
    
    /**
     * 评分：1-5星
     */
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
    @TableField("is_anonymous")
    private Boolean isAnonymous;
    
    /**
     * 状态：0待审核，1已通过，2已拒绝
     */
    private Integer status;
    
    /**
     * 商家回复内容
     */
    @TableField("reply_content")
    private String replyContent;
    
    /**
     * 商家回复时间
     */
    @TableField("reply_time")
    private LocalDateTime replyTime;
    
    /**
     * 有用数
     */
    @TableField("helpful_count")
    private Integer helpfulCount;
    
    /**
     * 创建时间
     */
    @TableField("created_at")
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField("updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * 逻辑删除
     */
    private Boolean deleted;
}

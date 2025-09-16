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
 * 评价有用实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("review_helpful")
public class ReviewHelpful {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 评价ID
     */
    @TableField("review_id")
    private Long reviewId;
    
    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;
    
    /**
     * 创建时间
     */
    @TableField("created_at")
    private LocalDateTime createdAt;
}

package com.cinema.booking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("tour_routes")
public class TourRoute {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    @TableField("cover_image")
    private String coverImage;

    private String description;

    private Integer days;

    private String difficulty;

    @TableField("suitable_crowd")
    private String suitableCrowd;

    @TableField("budget_min")
    private BigDecimal budgetMin;

    @TableField("budget_max")
    private BigDecimal budgetMax;

    private String tags;

    private String tips;

    @TableField("view_count")
    private Integer viewCount;

    private BigDecimal rating;

    @TableField("rating_count")
    private Integer ratingCount;

    @TableField("is_official")
    private Boolean isOfficial;

    private Integer status;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    private Boolean deleted;
}

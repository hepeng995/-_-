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

/**
 * 商品实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("products")
public class Product {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 商品名称
     */
    private String name;
    
    /**
     * 分类ID
     */
    @TableField("category_id")
    private Long categoryId;
    
    /**
     * 商品描述
     */
    private String description;
    
    /**
     * 封面图片
     */
    @TableField("cover_image")
    private String coverImage;
    
    /**
     * 图片集合（JSON数组）
     */
    private String images;
    
    /**
     * 价格
     */
    private BigDecimal price;
    
    /**
     * 原价
     */
    @TableField("original_price")
    private BigDecimal originalPrice;
    
    /**
     * 库存数量
     */
    private Integer stock;
    
    /**
     * 销量
     */
    @TableField("sales_count")
    private Integer salesCount;
    
    /**
     * 单位
     */
    private String unit;
    
    /**
     * 重量（kg）
     */
    private BigDecimal weight;
    
    /**
     * 规格参数（JSON）
     */
    private String specifications;
    
    /**
     * 产地
     */
    private String origin;
    
    /**
     * 评分
     */
    private BigDecimal rating;
    
    /**
     * 评价总数
     */
    @TableField("review_count")
    private Integer reviewCount;
    
    /**
     * 平均评分
     */
    @TableField("avg_rating")
    private BigDecimal avgRating;
    
    /**
     * 状态：0下架，1上架
     */
    private Integer status;
    
    /**
     * 是否推荐：0否，1是
     */
    @TableField("is_featured")
    private Boolean isFeatured;
    
    /**
     * 排序值
     */
    @TableField("sort_order")
    private Integer sortOrder;
    
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

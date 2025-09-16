package com.cinema.booking.dto;

import lombok.Data;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品DTO
 */
@Data
public class ProductDTO {
    
    private Long id;
    
    /**
     * 商品名称
     */
    @NotBlank(message = "商品名称不能为空")
    private String name;
    
    /**
     * 分类ID
     */
    @NotNull(message = "分类ID不能为空")
    private Long categoryId;
    
    /**
     * 商品描述
     */
    private String description;
    
    /**
     * 封面图片
     */
    private String coverImage;
    
    /**
     * 图片集合（JSON数组）
     */
    private String images;
    
    /**
     * 价格
     */
    @NotNull(message = "价格不能为空")
    @DecimalMin(value = "0.01", message = "价格必须大于0")
    private BigDecimal price;
    
    /**
     * 原价
     */
    @DecimalMin(value = "0.00", message = "原价不能为负数")
    private BigDecimal originalPrice;
    
    /**
     * 库存数量
     */
    @Min(value = 0, message = "库存数量不能为负数")
    private Integer stock;
    
    /**
     * 销量
     */
    private Integer salesCount;
    
    /**
     * 单位
     */
    private String unit;
    
    /**
     * 重量（kg）
     */
    @DecimalMin(value = "0.00", message = "重量不能为负数")
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
    private Integer reviewCount;
    
    /**
     * 平均评分
     */
    private BigDecimal avgRating;
    
    /**
     * 状态：0下架，1上架
     */
    private Integer status;
    
    /**
     * 是否推荐：0否，1是
     */
    private Boolean isFeatured;
    
    /**
     * 排序值
     */
    private Integer sortOrder;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 分类名称
     */
    private String categoryName;
}

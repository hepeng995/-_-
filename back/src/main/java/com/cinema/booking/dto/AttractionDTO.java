package com.cinema.booking.dto;

import lombok.Data;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 景点DTO
 */
@Data
public class AttractionDTO {
    
    private Long id;
    
    /**
     * 景点名称
     */
    @NotBlank(message = "景点名称不能为空")
    private String name;
    
    /**
     * 分类ID
     */
    @NotNull(message = "分类ID不能为空")
    private Long categoryId;
    
    /**
     * 景点描述
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
     * 360°全景图URL
     */
    private String panoramaUrl;
    
    /**
     * 经度
     */
    @DecimalMin(value = "-180.000000", message = "经度值无效")
    @DecimalMax(value = "180.000000", message = "经度值无效")
    private BigDecimal longitude;
    
    /**
     * 纬度
     */
    @DecimalMin(value = "-90.000000", message = "纬度值无效")
    @DecimalMax(value = "90.000000", message = "纬度值无效")
    private BigDecimal latitude;
    
    /**
     * 详细地址
     */
    private String address;
    
    /**
     * 交通指引
     */
    private String trafficGuide;
    
    /**
     * 开放时间
     */
    private String openingHours;
    
    /**
     * 门票价格
     */
    @DecimalMin(value = "0.00", message = "门票价格不能为负数")
    private BigDecimal ticketPrice;
    
    /**
     * 评分
     */
    private BigDecimal rating;
    
    /**
     * 浏览次数
     */
    private Integer viewCount;
    
    /**
     * 状态：0禁用，1启用
     */
    private Integer status;
    
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

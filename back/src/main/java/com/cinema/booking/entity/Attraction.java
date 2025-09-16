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
 * 景点实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("attractions")
public class Attraction {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 景点名称
     */
    private String name;
    
    /**
     * 分类ID
     */
    @TableField("category_id")
    private Long categoryId;
    
    /**
     * 景点描述
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
     * 360°全景图URL
     */
    @TableField("panorama_url")
    private String panoramaUrl;
    
    /**
     * 经度
     */
    private BigDecimal longitude;
    
    /**
     * 纬度
     */
    private BigDecimal latitude;
    
    /**
     * 详细地址
     */
    private String address;
    
    /**
     * 交通指引
     */
    @TableField("traffic_guide")
    private String trafficGuide;
    
    /**
     * 开放时间
     */
    @TableField("opening_hours")
    private String openingHours;
    
    /**
     * 门票价格
     */
    @TableField("ticket_price")
    private BigDecimal ticketPrice;
    
    /**
     * 评分
     */
    private BigDecimal rating;
    
    /**
     * 浏览次数
     */
    @TableField("view_count")
    private Integer viewCount;
    
    /**
     * 状态：0禁用，1启用
     */
    private Integer status;
    
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

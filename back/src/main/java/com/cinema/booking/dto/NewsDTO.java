package com.cinema.booking.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 资讯DTO
 */
@Data
public class NewsDTO {
    
    private Long id;
    
    /**
     * 标题
     */
    @NotBlank(message = "标题不能为空")
    private String title;
    
    /**
     * 摘要
     */
    private String summary;
    
    /**
     * 内容
     */
    private String content;
    
    /**
     * 封面图片
     */
    private String coverImage;
    
    /**
     * 分类：news-新闻，policy-政策，activity-活动
     */
    @NotBlank(message = "分类不能为空")
    private String category;
    
    /**
     * 作者
     */
    private String author;
    
    /**
     * 来源
     */
    private String source;
    
    /**
     * 浏览次数
     */
    private Integer viewCount;
    
    /**
     * 是否置顶：0否，1是
     */
    private Boolean isTop;
    
    /**
     * 是否推荐：0否，1是
     */
    private Boolean isFeatured;
    
    /**
     * 发布时间
     */
    @NotNull(message = "发布时间不能为空")
    private LocalDateTime publishTime;
    
    /**
     * 状态：0草稿，1已发布，2已下线
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
     * 分类描述
     */
    private String categoryDesc;
    
    /**
     * 状态描述
     */
    private String statusDesc;
}

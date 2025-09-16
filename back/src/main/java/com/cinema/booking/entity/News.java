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
 * 资讯实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("news")
public class News {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 标题
     */
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
    @TableField("cover_image")
    private String coverImage;
    
    /**
     * 分类：news-新闻，policy-政策，activity-活动
     */
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
    @TableField("view_count")
    private Integer viewCount;
    
    /**
     * 是否置顶：0否，1是
     */
    @TableField("is_top")
    private Boolean isTop;
    
    /**
     * 是否推荐：0否，1是
     */
    @TableField("is_featured")
    private Boolean isFeatured;
    
    /**
     * 发布时间
     */
    @TableField("publish_time")
    private LocalDateTime publishTime;
    
    /**
     * 状态：0草稿，1已发布，2已下线
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

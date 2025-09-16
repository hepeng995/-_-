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
 * 论坛帖子实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("forum_posts")
public class ForumPost {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 帖子标题
     */
    private String title;
    
    /**
     * 帖子内容
     */
    private String content;
    
    /**
     * 建议类型：environment-环境问题，infrastructure-基础设施，agriculture-农业发展，tourism-旅游发展，education-教育文化，other-其他
     */
    private String category;
    
    /**
     * 图片集合（JSON数组）
     */
    private String images;
    
    /**
     * 发帖用户ID
     */
    @TableField("user_id")
    private Long userId;
    
    /**
     * 审核状态：0待审核，1已通过，2已拒绝
     */
    private Integer status;
    
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
     * 浏览次数
     */
    @TableField("view_count")
    private Integer viewCount;
    
    /**
     * 点赞数
     */
    @TableField("like_count")
    private Integer likeCount;
    
    /**
     * 评论数
     */
    @TableField("comment_count")
    private Integer commentCount;
    
    /**
     * 管理员回复
     */
    @TableField("admin_reply")
    private String adminReply;
    
    /**
     * 管理员回复时间
     */
    @TableField("admin_reply_time")
    private LocalDateTime adminReplyTime;
    
    /**
     * 拒绝原因
     */
    @TableField("reject_reason")
    private String rejectReason;
    
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
}

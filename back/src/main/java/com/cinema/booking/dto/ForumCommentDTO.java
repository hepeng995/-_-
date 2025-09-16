package com.cinema.booking.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 论坛评论DTO
 */
@Data
public class ForumCommentDTO {
    
    private Long id;
    
    /**
     * 帖子ID
     */
    @NotNull(message = "帖子ID不能为空")
    private Long postId;
    
    /**
     * 评论用户ID
     */
    private Long userId;
    
    /**
     * 父评论ID，用于回复功能
     */
    private Long parentId;
    
    /**
     * 评论内容
     */
    @NotBlank(message = "评论内容不能为空")
    private String content;
    
    /**
     * 图片集合（JSON数组）
     */
    private String images;
    
    /**
     * 点赞数
     */
    private Integer likeCount;
    
    /**
     * 状态：0待审核，1已通过，2已拒绝
     */
    private Integer status;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    // 扩展字段
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 用户真实姓名
     */
    private String realName;
    
    /**
     * 用户头像
     */
    private String userAvatar;
    
    /**
     * 状态描述
     */
    private String statusDesc;
    
    /**
     * 当前用户是否点赞了该评论
     */
    private Boolean isLiked;
    
    /**
     * 父评论信息
     */
    private ForumCommentDTO parentComment;
    
    /**
     * 子评论列表
     */
    private List<ForumCommentDTO> replies;
}

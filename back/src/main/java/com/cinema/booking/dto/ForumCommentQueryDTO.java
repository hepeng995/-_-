package com.cinema.booking.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 论坛评论查询DTO
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ForumCommentQueryDTO extends PageRequest {
    
    /**
     * 帖子ID
     */
    private Long postId;
    
    /**
     * 评论用户ID
     */
    private Long userId;
    
    /**
     * 父评论ID
     */
    private Long parentId;
    
    /**
     * 状态：0待审核，1已通过，2已拒绝
     */
    private Integer status;
    
    /**
     * 关键词（内容）
     */
    private String keyword;
    
    /**
     * 排序字段：created_at-创建时间，like_count-点赞数
     */
    private String sortField = "created_at";
    
    /**
     * 排序方式：asc-升序，desc-降序
     */
    private String sortOrder = "asc";
}

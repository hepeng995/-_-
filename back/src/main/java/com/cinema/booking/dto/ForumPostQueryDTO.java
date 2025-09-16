package com.cinema.booking.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 论坛帖子查询DTO
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ForumPostQueryDTO extends PageRequest {
    
    /**
     * 关键词（标题、内容）
     */
    private String keyword;
    
    /**
     * 建议类型
     */
    private String category;
    
    /**
     * 审核状态：0待审核，1已通过，2已拒绝
     */
    private Integer status;
    
    /**
     * 发帖用户ID
     */
    private Long userId;
    
    /**
     * 是否置顶
     */
    private Boolean isTop;
    
    /**
     * 是否推荐
     */
    private Boolean isFeatured;
    
    /**
     * 排序字段：created_at-创建时间，view_count-浏览量，like_count-点赞数，comment_count-评论数
     */
    private String sortField = "created_at";
    
    /**
     * 排序方式：asc-升序，desc-降序
     */
    private String sortOrder = "desc";
}

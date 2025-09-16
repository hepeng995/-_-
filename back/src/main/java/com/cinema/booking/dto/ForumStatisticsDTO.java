package com.cinema.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 论坛统计DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumStatisticsDTO {
    
    /**
     * 总帖子数
     */
    private Long totalPosts;
    
    /**
     * 总评论数
     */
    private Long totalComments;
    
    /**
     * 待审核帖子数
     */
    private Long pendingPosts;
    
    /**
     * 已通过帖子数
     */
    private Long approvedPosts;
    
    /**
     * 已拒绝帖子数
     */
    private Long rejectedPosts;
    
    /**
     * 分类统计
     */
    private List<CategoryStatistics> categoryStatistics;
    
    /**
     * 热门帖子（按点赞数排序）
     */
    private List<ForumPostDTO> hotPosts;
    
    /**
     * 最新帖子
     */
    private List<ForumPostDTO> latestPosts;
    
    /**
     * 月度统计数据
     */
    private List<MonthlyStatistics> monthlyStatistics;
    
    /**
     * 分类统计内部类
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStatistics {
        private String category;
        private String categoryDesc;
        private Long count;
        private Double percentage;
    }
    
    /**
     * 月度统计内部类
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStatistics {
        private String month;
        private Long postCount;
        private Long commentCount;
    }
}

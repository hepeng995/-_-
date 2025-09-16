package com.cinema.booking.controller;

import com.cinema.booking.dto.ForumStatisticsDTO;
import com.cinema.booking.service.ForumPostService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 论坛数据统计控制器
 */
@Tag(name = "论坛数据统计", description = "论坛数据可视化统计接口")
@RestController
@RequestMapping("/forum/statistics")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class ForumStatisticsController {
    
    private final ForumPostService forumPostService;
    
    /**
     * 获取论坛综合统计数据
     */
    @Operation(summary = "获取论坛综合统计数据")
    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<ForumStatisticsDTO> getForumOverview() {
        ForumStatisticsDTO statistics = forumPostService.getForumStatistics();
        return Result.success(statistics);
    }
    
    /**
     * 获取建议类型分布统计（饼图数据）
     */
    @Operation(summary = "获取建议类型分布统计")
    @GetMapping("/category-distribution")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getCategoryDistribution() {
        ForumStatisticsDTO statistics = forumPostService.getForumStatistics();
        
        Map<String, Object> result = new HashMap<>();
        result.put("categories", statistics.getCategoryStatistics());
        result.put("total", statistics.getTotalPosts());
        
        return Result.success(result);
    }
    
    /**
     * 获取热度排序数据（柱状图数据）
     */
    @Operation(summary = "获取热度排序数据")
    @GetMapping("/hot-ranking")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getHotRanking() {
        ForumStatisticsDTO statistics = forumPostService.getForumStatistics();
        
        Map<String, Object> result = new HashMap<>();
        result.put("hotPosts", statistics.getHotPosts());
        result.put("latestPosts", statistics.getLatestPosts());
        
        return Result.success(result);
    }
    
    /**
     * 获取月度趋势数据（折线图数据）
     */
    @Operation(summary = "获取月度趋势数据")
    @GetMapping("/monthly-trend")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getMonthlyTrend() {
        ForumStatisticsDTO statistics = forumPostService.getForumStatistics();
        
        Map<String, Object> result = new HashMap<>();
        result.put("monthlyData", statistics.getMonthlyStatistics());
        
        return Result.success(result);
    }
    
    /**
     * 获取审核状态统计（环形图数据）
     */
    @Operation(summary = "获取审核状态统计")
    @GetMapping("/audit-status")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getAuditStatus() {
        ForumStatisticsDTO statistics = forumPostService.getForumStatistics();
        
        Map<String, Object> result = new HashMap<>();
        result.put("total", statistics.getTotalPosts());
        result.put("pending", statistics.getPendingPosts());
        result.put("approved", statistics.getApprovedPosts());
        result.put("rejected", statistics.getRejectedPosts());
        
        return Result.success(result);
    }
    
    /**
     * 获取用户公开的统计数据（不需要管理员权限）
     */
    @Operation(summary = "获取用户公开的统计数据")
    @GetMapping("/public")
    public Result<Map<String, Object>> getPublicStatistics() {
        ForumStatisticsDTO statistics = forumPostService.getForumStatistics();
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalPosts", statistics.getApprovedPosts()); // 只显示已通过的帖子数
        result.put("categoryStatistics", statistics.getCategoryStatistics());
        result.put("hotPosts", statistics.getHotPosts());
        result.put("latestPosts", statistics.getLatestPosts());
        
        return Result.success(result);
    }
}

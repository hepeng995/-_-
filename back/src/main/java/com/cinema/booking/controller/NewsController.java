package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.dto.NewsDTO;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.entity.News;
import com.cinema.booking.mapper.NewsMapper;
import com.cinema.booking.service.NewsService;
import com.cinema.booking.service.TianApiNewsService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 资讯控制器
 */
@Tag(name = "资讯管理", description = "资讯相关接口")
@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
@Validated
public class NewsController {
    
    private final NewsService newsService;
    private final TianApiNewsService tianApiNewsService;
    private final NewsMapper newsMapper;
    
    @Operation(summary = "分页查询资讯列表")
    @GetMapping("/page")
    public Result<IPage<NewsDTO>> getNewsPage(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "分类") @RequestParam(required = false) String category,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "是否置顶") @RequestParam(required = false) Boolean isTop,
            @Parameter(description = "是否推荐") @RequestParam(required = false) Boolean isFeatured) {
        
        PageRequest pageRequest = new PageRequest(pageNum, pageSize);
        IPage<NewsDTO> page = newsService.getNewsPage(pageRequest, category, keyword, status, isTop, isFeatured);
        return Result.ok(page);
    }
    
    @Operation(summary = "获取资讯详情")
    @GetMapping("/{id}")
    public Result<NewsDTO> getNewsById(@PathVariable Long id) {
        NewsDTO news = newsService.getNewsById(id);
        // 增加浏览次数
        newsService.incrementViewCount(id);
        return Result.ok(news);
    }
    
    @Operation(summary = "创建资讯")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "资讯管理", operation = "创建资讯", description = "创建新的资讯信息")
    public Result<NewsDTO> createNews(@Valid @RequestBody NewsDTO newsDTO) {
        NewsDTO created = newsService.createNews(newsDTO);
        return Result.ok(created);
    }
    
    @Operation(summary = "更新资讯")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "资讯管理", operation = "更新资讯", description = "更新资讯信息")
    public Result<NewsDTO> updateNews(@PathVariable Long id, @Valid @RequestBody NewsDTO newsDTO) {
        NewsDTO updated = newsService.updateNews(id, newsDTO);
        return Result.ok(updated);
    }
    
    @Operation(summary = "删除资讯")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "资讯管理", operation = "删除资讯", description = "删除资讯信息")
    public Result<Void> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return Result.ok();
    }

    @Operation(summary = "批量删除资讯")
    @DeleteMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "资讯管理", operation = "批量删除资讯", description = "批量删除资讯")
    public Result<Void> batchDeleteNews(@RequestBody List<Long> ids) {
        newsMapper.deleteBatchIds(ids);
        return Result.ok();
    }

    @Operation(summary = "批量更新资讯状态")
    @PutMapping("/batch/status")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "资讯管理", operation = "批量更新资讯状态", description = "批量发布/下线资讯")
    public Result<Void> batchUpdateNewsStatus(@RequestBody Map<String, Object> params) {
        @SuppressWarnings("unchecked")
        List<Long> ids = (List<Long>) params.get("ids");
        Integer status = (Integer) params.get("status");
        LambdaUpdateWrapper<News> wrapper = new LambdaUpdateWrapper<>();
        wrapper.in(News::getId, ids).set(News::getStatus, status);
        newsMapper.update(null, wrapper);
        return Result.ok();
    }
    
    @Operation(summary = "获取置顶资讯列表")
    @GetMapping("/top")
    public Result<List<NewsDTO>> getTopNews(
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "3") Integer limit) {
        List<NewsDTO> newsList = newsService.getTopNews(limit);
        return Result.ok(newsList);
    }
    
    @Operation(summary = "获取推荐资讯列表")
    @GetMapping("/featured")
    public Result<List<NewsDTO>> getFeaturedNews(
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "6") Integer limit) {
        List<NewsDTO> newsList = newsService.getFeaturedNews(limit);
        return Result.ok(newsList);
    }
    
    @Operation(summary = "获取热门资讯列表")
    @GetMapping("/hot")
    public Result<List<NewsDTO>> getHotNews(
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "6") Integer limit) {
        List<NewsDTO> newsList = newsService.getHotNews(limit);
        return Result.ok(newsList);
    }
    
    @Operation(summary = "根据分类获取资讯列表")
    @GetMapping("/category/{category}")
    public Result<List<NewsDTO>> getNewsByCategory(
            @PathVariable String category,
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "10") Integer limit) {
        List<NewsDTO> newsList = newsService.getNewsByCategory(category, limit);
        return Result.ok(newsList);
    }
    
    @Operation(summary = "发布资讯")
    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "资讯管理", operation = "发布资讯", description = "发布资讯")
    public Result<NewsDTO> publishNews(@PathVariable Long id) {
        NewsDTO published = newsService.publishNews(id);
        return Result.ok(published);
    }
    
    @Operation(summary = "下线资讯")
    @PutMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "资讯管理", operation = "下线资讯", description = "下线资讯")
    public Result<NewsDTO> unpublishNews(@PathVariable Long id) {
        NewsDTO unpublished = newsService.unpublishNews(id);
        return Result.ok(unpublished);
    }
    
    @Operation(summary = "获取最新资讯列表")
    @GetMapping("/latest")
    public Result<List<NewsDTO>> getLatestNews(
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "4") Integer limit) {
        List<NewsDTO> newsList = newsService.getLatestNews(limit);
        return Result.ok(newsList);
    }
    
    @Operation(summary = "增加资讯浏览量")
    @PostMapping("/{id}/view")
    public Result<Void> increaseViewCount(@PathVariable Long id) {
        newsService.incrementViewCount(id);
        return Result.ok();
    }
    
    @Operation(summary = "获取公告列表")
    @GetMapping("/announcements")
    public Result<List<NewsDTO>> getAnnouncements(
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "5") Integer limit) {
        // 使用置顶资讯作为公告
        List<NewsDTO> newsList = newsService.getTopNews(limit);
        return Result.ok(newsList);
    }
    
    @Operation(summary = "获取资讯统计信息")
    @GetMapping("/stats")
    public Result<Object> getNewsStats() {
        // 简单的统计信息
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalNews", newsService.getTotalCount());
        stats.put("todayNews", newsService.getTodayCount());
        stats.put("totalViews", newsService.getTotalViews());
        return Result.ok(stats);
    }

    @Operation(summary = "从TianAPI同步农业新闻")
    @PostMapping("/sync")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "资讯管理", operation = "同步TianAPI新闻", description = "从天聚数行同步农业新闻到本地")
    public Result<Map<String, Object>> syncTianApiNews(
            @Parameter(description = "分类 (news/policy/activity)") @RequestParam(defaultValue = "news") String category,
            @Parameter(description = "搜索关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "获取数量 (1-50)") @RequestParam(defaultValue = "20") Integer num,
            @Parameter(description = "强制刷新缓存") @RequestParam(defaultValue = "false") Boolean force) {
        Map<String, Object> result = tianApiNewsService.syncNews(category, keyword, num, force);
        return Result.ok(result);
    }

    @Operation(summary = "回填已有文章正文内容")
    @PostMapping("/backfill")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "资讯管理", operation = "回填文章正文", description = "从原文URL抓取完整正文并更新数据库")
    public Result<Map<String, Object>> backfillContent() {
        Map<String, Object> result = tianApiNewsService.backfillContent();
        return Result.ok(result);
    }

    @Operation(summary = "回填缺少的封面图")
    @PostMapping("/backfill-covers")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "资讯管理", operation = "回填封面图", description = "从TianAPI重新匹配并下载缺失的封面图")
    public Result<Map<String, Object>> backfillCoverImages() {
        Map<String, Object> result = tianApiNewsService.backfillCoverImages();
        return Result.ok(result);
    }
}

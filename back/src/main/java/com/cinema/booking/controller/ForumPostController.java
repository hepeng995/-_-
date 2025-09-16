package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.dto.ForumPostDTO;
import com.cinema.booking.dto.ForumPostQueryDTO;
import com.cinema.booking.dto.ForumStatisticsDTO;
import com.cinema.booking.service.ForumPostService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 论坛帖子控制器
 */
@Tag(name = "论坛帖子管理", description = "论坛帖子相关接口")
@RestController
@RequestMapping("/forum/posts")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class ForumPostController {
    
    private final ForumPostService forumPostService;
    
    /**
     * 创建帖子
     */
    @Operation(summary = "创建帖子")
    @PostMapping
    @SystemOperation(module = "论坛管理", operation = "创建帖子", description = "用户创建论坛帖子")
    public Result<Long> createPost(@Valid @RequestBody ForumPostDTO postDTO) {
        Long postId = forumPostService.createPost(postDTO);
        return Result.success(postId);
    }
    
    /**
     * 更新帖子
     */
    @Operation(summary = "更新帖子")
    @PutMapping("/{id}")
    @SystemOperation(module = "论坛管理", operation = "更新帖子", description = "用户更新论坛帖子")
    public Result<Void> updatePost(
            @Parameter(description = "帖子ID") @PathVariable Long id,
            @Valid @RequestBody ForumPostDTO postDTO) {
        log.info("接收到更新帖子请求 - ID: {}, 图片数据: {}", id, postDTO.getImages());
        forumPostService.updatePost(id, postDTO);
        return Result.success();
    }
    
    /**
     * 删除帖子
     */
    @Operation(summary = "删除帖子")
    @DeleteMapping("/{id}")
    @SystemOperation(module = "论坛管理", operation = "删除帖子", description = "用户删除论坛帖子")
    public Result<Void> deletePost(@Parameter(description = "帖子ID") @PathVariable Long id) {
        forumPostService.deletePost(id);
        return Result.success();
    }
    
    /**
     * 获取帖子详情
     */
    @Operation(summary = "获取帖子详情")
    @GetMapping("/{id}")
    public Result<ForumPostDTO> getPost(@Parameter(description = "帖子ID") @PathVariable Long id) {
        // 增加浏览次数
        forumPostService.incrementViewCount(id);
        
        ForumPostDTO postDTO = forumPostService.getPostById(id);
        return Result.success(postDTO);
    }
    
    /**
     * 分页查询帖子列表
     */
    @Operation(summary = "分页查询帖子列表")
    @GetMapping("/page")
    public Result<IPage<ForumPostDTO>> getPostsPage(@Parameter(hidden = true) ForumPostQueryDTO queryDTO) {
        IPage<ForumPostDTO> page = forumPostService.getPostsPage(queryDTO);
        return Result.success(page);
    }
    
    /**
     * 审核帖子
     */
    @Operation(summary = "审核帖子")
    @PostMapping("/{id}/audit")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "论坛管理", operation = "审核帖子", description = "管理员审核论坛帖子")
    public Result<Void> auditPost(
            @Parameter(description = "帖子ID") @PathVariable Long id,
            @RequestParam Integer status,
            @RequestParam(required = false) String rejectReason,
            @RequestParam(required = false) String adminReply) {
        forumPostService.auditPost(id, status, rejectReason, adminReply);
        return Result.success();
    }
    
    /**
     * 设置帖子置顶
     */
    @Operation(summary = "设置帖子置顶")
    @PostMapping("/{id}/top")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "论坛管理", operation = "设置置顶", description = "管理员设置帖子置顶")
    public Result<Void> setPostTop(
            @Parameter(description = "帖子ID") @PathVariable Long id,
            @RequestParam Boolean isTop) {
        forumPostService.setPostTop(id, isTop);
        return Result.success();
    }
    
    /**
     * 设置帖子推荐
     */
    @Operation(summary = "设置帖子推荐")
    @PostMapping("/{id}/featured")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "论坛管理", operation = "设置推荐", description = "管理员设置帖子推荐")
    public Result<Void> setPostFeatured(
            @Parameter(description = "帖子ID") @PathVariable Long id,
            @RequestParam Boolean isFeatured) {
        forumPostService.setPostFeatured(id, isFeatured);
        return Result.success();
    }
    
    /**
     * 点赞/取消点赞帖子
     */
    @Operation(summary = "点赞/取消点赞帖子")
    @PostMapping("/{id}/like")
    @SystemOperation(module = "论坛管理", operation = "点赞帖子", description = "用户点赞论坛帖子")
    public Result<Boolean> togglePostLike(@Parameter(description = "帖子ID") @PathVariable Long id) {
        boolean isLiked = forumPostService.togglePostLike(id);
        return Result.success(isLiked);
    }
    
    /**
     * 获取论坛统计数据
     */
    @Operation(summary = "获取论坛统计数据")
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<ForumStatisticsDTO> getForumStatistics() {
        ForumStatisticsDTO statistics = forumPostService.getForumStatistics();
        return Result.success(statistics);
    }
}

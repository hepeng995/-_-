package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.dto.ForumCommentDTO;
import com.cinema.booking.dto.ForumCommentQueryDTO;
import com.cinema.booking.service.ForumCommentService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 论坛评论控制器
 */
@Tag(name = "论坛评论管理", description = "论坛评论相关接口")
@RestController
@RequestMapping("/forum/comments")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class ForumCommentController {
    
    private final ForumCommentService forumCommentService;
    
    /**
     * 创建评论
     */
    @Operation(summary = "创建评论")
    @PostMapping
    @SystemOperation(module = "论坛管理", operation = "创建评论", description = "用户创建论坛评论")
    public Result<Long> createComment(@Valid @RequestBody ForumCommentDTO commentDTO) {
        Long commentId = forumCommentService.createComment(commentDTO);
        return Result.success(commentId);
    }
    
    /**
     * 更新评论
     */
    @Operation(summary = "更新评论")
    @PutMapping("/{id}")
    @SystemOperation(module = "论坛管理", operation = "更新评论", description = "用户更新论坛评论")
    public Result<Void> updateComment(
            @Parameter(description = "评论ID") @PathVariable Long id,
            @Valid @RequestBody ForumCommentDTO commentDTO) {
        forumCommentService.updateComment(id, commentDTO);
        return Result.success();
    }
    
    /**
     * 删除评论
     */
    @Operation(summary = "删除评论")
    @DeleteMapping("/{id}")
    @SystemOperation(module = "论坛管理", operation = "删除评论", description = "用户删除论坛评论")
    public Result<Void> deleteComment(@Parameter(description = "评论ID") @PathVariable Long id) {
        forumCommentService.deleteComment(id);
        return Result.success();
    }
    
    /**
     * 获取评论详情
     */
    @Operation(summary = "获取评论详情")
    @GetMapping("/{id}")
    public Result<ForumCommentDTO> getComment(@Parameter(description = "评论ID") @PathVariable Long id) {
        ForumCommentDTO commentDTO = forumCommentService.getCommentById(id);
        return Result.success(commentDTO);
    }
    
    /**
     * 分页查询评论列表
     */
    @Operation(summary = "分页查询评论列表")
    @GetMapping("/page")
    public Result<IPage<ForumCommentDTO>> getCommentsPage(@Parameter(hidden = true) ForumCommentQueryDTO queryDTO) {
        IPage<ForumCommentDTO> page = forumCommentService.getCommentsPage(queryDTO);
        return Result.success(page);
    }
    
    /**
     * 根据帖子ID获取评论列表
     */
    @Operation(summary = "根据帖子ID获取评论列表")
    @GetMapping("/post/{postId}")
    public Result<List<ForumCommentDTO>> getCommentsByPostId(
            @Parameter(description = "帖子ID") @PathVariable Long postId) {
        List<ForumCommentDTO> comments = forumCommentService.getCommentsByPostId(postId);
        return Result.success(comments);
    }
    
    /**
     * 审核评论
     */
    @Operation(summary = "审核评论")
    @PostMapping("/{id}/audit")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "论坛管理", operation = "审核评论", description = "管理员审核论坛评论")
    public Result<Void> auditComment(
            @Parameter(description = "评论ID") @PathVariable Long id,
            @RequestParam Integer status) {
        forumCommentService.auditComment(id, status);
        return Result.success();
    }

    /**
     * 批量审核评论
     */
    @Operation(summary = "批量审核评论")
    @PostMapping("/batch-audit")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "论坛管理", operation = "批量审核评论", description = "管理员批量审核论坛评论")
    public Result<java.util.Map<String, Object>> batchAuditComments(@RequestBody java.util.Map<String, Object> params) {
        @SuppressWarnings("unchecked")
        java.util.List<Object> rawIds = (java.util.List<Object>) params.get("ids");
        Integer status = params.get("status") != null ? Integer.valueOf(params.get("status").toString()) : null;
        if (rawIds == null || rawIds.isEmpty() || status == null) {
            return Result.fail("参数缺失");
        }
        java.util.List<Long> ids = rawIds.stream()
                .map(o -> Long.valueOf(o.toString()))
                .collect(java.util.stream.Collectors.toList());
        int success = 0;
        int failed = 0;
        for (Long id : ids) {
            try {
                forumCommentService.auditComment(id, status);
                success++;
            } catch (Exception e) {
                failed++;
            }
        }
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("success", success);
        data.put("failed", failed);
        data.put("total", ids.size());
        return Result.ok(data);
    }
    
    /**
     * 点赞/取消点赞评论
     */
    @Operation(summary = "点赞/取消点赞评论")
    @PostMapping("/{id}/like")
    @SystemOperation(module = "论坛管理", operation = "点赞评论", description = "用户点赞论坛评论")
    public Result<Boolean> toggleCommentLike(@Parameter(description = "评论ID") @PathVariable Long id) {
        boolean isLiked = forumCommentService.toggleCommentLike(id);
        return Result.success(isLiked);
    }
    
    /**
     * 取消点赞评论
     * @deprecated 已统一为 {@link #toggleCommentLike(Long)} (POST /forum/comments/{id}/like)，保留此接口仅为兼容旧前端
     */
    @Deprecated
    @Operation(summary = "[已废弃] 取消点赞评论（请使用 /like 切换接口）")
    @PostMapping("/{id}/unlike")
    @SystemOperation(module = "论坛管理", operation = "取消点赞评论", description = "用户取消点赞论坛评论（兼容旧接口）")
    public Result<Boolean> unlikeComment(@Parameter(description = "评论ID") @PathVariable Long id) {
        boolean isLiked = forumCommentService.unlikeComment(id);
        return Result.success(isLiked);
    }
}

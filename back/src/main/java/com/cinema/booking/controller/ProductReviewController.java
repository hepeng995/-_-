package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.dto.ProductReviewDTO;
import com.cinema.booking.dto.ReviewQueryDTO;
import com.cinema.booking.dto.ReviewReplyDTO;
import com.cinema.booking.security.SecurityService;
import com.cinema.booking.service.ProductReviewService;
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
 * 商品评价控制器
 */
@Tag(name = "商品评价管理", description = "商品评价相关接口")
@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Validated
public class ProductReviewController {
    
    private final ProductReviewService productReviewService;
    private final SecurityService securityService;
    
    @Operation(summary = "创建商品评价")
    @PostMapping
    @SystemOperation(module = "评价管理", operation = "创建评价", description = "用户创建商品评价")
    public Result<ProductReviewDTO> createReview(@Valid @RequestBody ProductReviewDTO reviewDTO) {
        // 设置当前用户ID
        reviewDTO.setUserId(securityService.getCurrentUserId());
        ProductReviewDTO result = productReviewService.createReview(reviewDTO);
        return Result.ok(result);
    }
    
    @Operation(summary = "分页查询评价列表")
    @GetMapping("/page")
    public Result<IPage<ProductReviewDTO>> getReviewPage(
            @Parameter(description = "商品ID") @RequestParam(required = false) Long productId,
            @Parameter(description = "用户ID") @RequestParam(required = false) Long userId,
            @Parameter(description = "评分筛选") @RequestParam(required = false) Integer rating,
            @Parameter(description = "状态筛选") @RequestParam(required = false) Integer status,
            @Parameter(description = "是否有图片") @RequestParam(required = false) Boolean hasImages,
            @Parameter(description = "排序方式") @RequestParam(defaultValue = "time") String sortBy,
            @Parameter(description = "排序方向") @RequestParam(defaultValue = "desc") String sortOrder,
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") Long current,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Long size) {
        
        ReviewQueryDTO queryDTO = new ReviewQueryDTO();
        queryDTO.setProductId(productId);
        queryDTO.setUserId(userId);
        queryDTO.setRating(rating);
        queryDTO.setStatus(status);
        queryDTO.setHasImages(hasImages);
        queryDTO.setSortBy(sortBy);
        queryDTO.setSortOrder(sortOrder);
        queryDTO.setCurrent(current);
        queryDTO.setSize(size);
        
        Long currentUserId = securityService.getCurrentUserId();
        IPage<ProductReviewDTO> page = productReviewService.getReviewPage(queryDTO, currentUserId);
        return Result.ok(page);
    }
    
    @Operation(summary = "获取评价详情")
    @GetMapping("/{id}")
    public Result<ProductReviewDTO> getReviewById(@PathVariable Long id) {
        Long currentUserId = securityService.getCurrentUserId();
        ProductReviewDTO review = productReviewService.getReviewById(id, currentUserId);
        return Result.ok(review);
    }
    
    @Operation(summary = "更新评价")
    @PutMapping("/{id}")
    @SystemOperation(module = "评价管理", operation = "更新评价", description = "用户更新商品评价")
    public Result<ProductReviewDTO> updateReview(@PathVariable Long id, @Valid @RequestBody ProductReviewDTO reviewDTO) {
        ProductReviewDTO result = productReviewService.updateReview(id, reviewDTO);
        return Result.ok(result);
    }
    
    @Operation(summary = "删除评价")
    @DeleteMapping("/{id}")
    @SystemOperation(module = "评价管理", operation = "删除评价", description = "用户删除商品评价")
    public Result<Void> deleteReview(@PathVariable Long id) {
        Long currentUserId = securityService.getCurrentUserId();
        productReviewService.deleteReview(id, currentUserId);
        return Result.ok();
    }
    
    @Operation(summary = "商家回复评价")
    @PostMapping("/reply")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "评价管理", operation = "回复评价", description = "商家回复用户评价")
    public Result<Void> replyReview(@Valid @RequestBody ReviewReplyDTO replyDTO) {
        productReviewService.replyReview(replyDTO);
        return Result.ok();
    }
    
    @Operation(summary = "点赞/取消点赞评价")
    @PostMapping("/{reviewId}/helpful")
    @SystemOperation(module = "评价管理", operation = "点赞评价", description = "用户点赞或取消点赞评价")
    public Result<Map<String, Object>> toggleHelpful(@PathVariable Long reviewId) {
        Long currentUserId = securityService.getCurrentUserId();
        boolean isHelpful = productReviewService.toggleHelpful(reviewId, currentUserId);
        return Result.ok(Map.of("isHelpful", isHelpful));
    }
    
    @Operation(summary = "获取商品评价统计信息")
    @GetMapping("/stats/{productId}")
    public Result<Map<String, Object>> getReviewStats(@PathVariable Long productId) {
        Map<String, Object> stats = productReviewService.getReviewStats(productId);
        return Result.ok(stats);
    }
    
    @Operation(summary = "获取商品评价分布")
    @GetMapping("/distribution/{productId}")
    public Result<List<Map<String, Object>>> getRatingDistribution(@PathVariable Long productId) {
        List<Map<String, Object>> distribution = productReviewService.getRatingDistribution(productId);
        return Result.ok(distribution);
    }
    
    @Operation(summary = "检查用户是否已评价商品")
    @GetMapping("/check")
    public Result<Map<String, Object>> checkUserReviewed(
            @Parameter(description = "商品ID") @RequestParam Long productId,
            @Parameter(description = "订单ID") @RequestParam(required = false) Long orderId) {
        Long currentUserId = securityService.getCurrentUserId();
        boolean hasReviewed = productReviewService.hasUserReviewed(currentUserId, productId, orderId);
        return Result.ok(Map.of("hasReviewed", hasReviewed));
    }
    
    @Operation(summary = "获取用户评价列表")
    @GetMapping("/user")
    public Result<IPage<ProductReviewDTO>> getUserReviews(
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") Long current,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Long size) {
        Long currentUserId = securityService.getCurrentUserId();
        IPage<ProductReviewDTO> page = productReviewService.getUserReviews(currentUserId, current, size);
        return Result.ok(page);
    }
    
    // 管理员接口
    @Operation(summary = "审核评价")
    @PutMapping("/{reviewId}/audit")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "评价管理", operation = "审核评价", description = "管理员审核用户评价")
    public Result<Void> auditReview(
            @PathVariable Long reviewId, 
            @Parameter(description = "审核状态：1-通过，2-拒绝") @RequestParam Integer status) {
        productReviewService.auditReview(reviewId, status);
        return Result.ok();
    }
    
    @Operation(summary = "批量审核评价")
    @PutMapping("/batch-audit")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "评价管理", operation = "批量审核评价", description = "管理员批量审核用户评价")
    public Result<Void> batchAuditReviews(
            @Parameter(description = "评价ID列表") @RequestBody List<Long> reviewIds,
            @Parameter(description = "审核状态：1-通过，2-拒绝") @RequestParam Integer status) {
        productReviewService.batchAuditReviews(reviewIds, status);
        return Result.ok();
    }
}

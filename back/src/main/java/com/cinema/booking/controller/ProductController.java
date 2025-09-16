package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.dto.CategoryDTO;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.dto.ProductDTO;
import com.cinema.booking.security.SecurityService;
import com.cinema.booking.service.ProductService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 商品控制器
 */
@Tag(name = "商品管理", description = "商品相关接口")
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Validated
public class ProductController {
    
    private final ProductService productService;
    private final ProductReviewService productReviewService;
    private final SecurityService securityService;
    
    @Operation(summary = "分页查询商品列表")
    @GetMapping("/page")
    public Result<IPage<ProductDTO>> getProductPage(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "分类ID") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "是否推荐") @RequestParam(required = false) Boolean isFeatured) {
        
        PageRequest pageRequest = new PageRequest(pageNum, pageSize);
        IPage<ProductDTO> page = productService.getProductPage(pageRequest, categoryId, keyword, status, isFeatured);
        return Result.ok(page);
    }
    
    @Operation(summary = "获取商品详情")
    @GetMapping("/{id}")
    public Result<ProductDTO> getProductById(@PathVariable Long id) {
        ProductDTO product = productService.getProductById(id);
        return Result.ok(product);
    }
    
    @Operation(summary = "创建商品")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "商品管理", operation = "创建商品", description = "创建新的商品信息")
    public Result<ProductDTO> createProduct(@Valid @RequestBody ProductDTO productDTO) {
        ProductDTO created = productService.createProduct(productDTO);
        return Result.ok(created);
    }
    
    @Operation(summary = "更新商品")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "商品管理", operation = "更新商品", description = "更新商品信息")
    public Result<ProductDTO> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDTO productDTO) {
        ProductDTO updated = productService.updateProduct(id, productDTO);
        return Result.ok(updated);
    }
    
    @Operation(summary = "删除商品")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "商品管理", operation = "删除商品", description = "删除商品信息")
    public Result<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return Result.ok();
    }
    
    @Operation(summary = "获取推荐商品列表")
    @GetMapping("/featured")
    public Result<List<ProductDTO>> getFeaturedProducts(
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "6") Integer limit) {
        List<ProductDTO> products = productService.getFeaturedProducts(limit);
        return Result.ok(products);
    }
    
    @Operation(summary = "获取热销商品列表")
    @GetMapping("/hot")
    public Result<List<ProductDTO>> getHotProducts(
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "6") Integer limit) {
        List<ProductDTO> products = productService.getHotProducts(limit);
        return Result.ok(products);
    }
    
    @Operation(summary = "根据分类获取商品列表")
    @GetMapping("/category/{categoryId}")
    public Result<List<ProductDTO>> getProductsByCategory(@PathVariable Long categoryId) {
        List<ProductDTO> products = productService.getProductsByCategory(categoryId);
        return Result.ok(products);
    }
    
    @Operation(summary = "获取商品分类列表")
    @GetMapping("/categories")
    public Result<List<CategoryDTO>> getProductCategories() {
        List<CategoryDTO> categories = productService.getProductCategories();
        return Result.ok(categories);
    }
    
    @Operation(summary = "创建商品分类")
    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "商品管理", operation = "创建分类", description = "创建商品分类")
    public Result<CategoryDTO> createProductCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO created = productService.createProductCategory(categoryDTO);
        return Result.ok(created);
    }
    
    @Operation(summary = "更新商品分类")
    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "商品管理", operation = "更新分类", description = "更新商品分类")
    public Result<CategoryDTO> updateProductCategory(@PathVariable Long id, @Valid @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO updated = productService.updateProductCategory(id, categoryDTO);
        return Result.ok(updated);
    }
    
    @Operation(summary = "删除商品分类")
    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "商品管理", operation = "删除分类", description = "删除商品分类")
    public Result<Void> deleteProductCategory(@PathVariable Long id) {
        productService.deleteProductCategory(id);
        return Result.ok();
    }
    
    @Operation(summary = "分页查询商品分类")
    @GetMapping("/categories/page")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "商品管理", operation = "分页查询分类", description = "分页查询商品分类")
    public Result<Object> getProductCategoriesPage(@RequestParam(defaultValue = "1") Integer current,
                                                   @RequestParam(defaultValue = "10") Integer size,
                                                   @RequestParam(required = false) String keyword,
                                                   @RequestParam(required = false) Integer status) {
        Object result = productService.getProductCategoriesPage(current, size, keyword, status);
        return Result.ok(result);
    }
    
    @Operation(summary = "更新商品分类状态")
    @PutMapping("/categories/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "商品管理", operation = "更新分类状态", description = "更新商品分类状态")
    public Result<Void> updateProductCategoryStatus(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        Integer status = request.get("status");
        productService.updateProductCategoryStatus(id, status);
        return Result.ok();
    }
    
    @Operation(summary = "获取商品评价列表")
    @GetMapping("/{id}/reviews")
    public Result<Map<String, Object>> getProductReviews(
            @PathVariable Long id,
            @Parameter(description = "评分筛选") @RequestParam(required = false) Integer rating,
            @Parameter(description = "是否有图片") @RequestParam(required = false) Boolean hasImages,
            @Parameter(description = "排序方式") @RequestParam(defaultValue = "time") String sortBy,
            @Parameter(description = "排序方向") @RequestParam(defaultValue = "desc") String sortOrder,
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") Long current,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Long size) {
        
        // 构建查询条件
        com.cinema.booking.dto.ReviewQueryDTO queryDTO = new com.cinema.booking.dto.ReviewQueryDTO();
        queryDTO.setProductId(id);
        queryDTO.setRating(rating);
        queryDTO.setStatus(1); // 只查询已通过审核的评价
        queryDTO.setHasImages(hasImages);
        queryDTO.setSortBy(sortBy);
        queryDTO.setSortOrder(sortOrder);
        queryDTO.setCurrent(current);
        queryDTO.setSize(size);
        
        Long currentUserId = securityService.getCurrentUserId();
        
        // 获取评价列表
        IPage<com.cinema.booking.dto.ProductReviewDTO> reviewPage = productReviewService.getReviewPage(queryDTO, currentUserId);
        
        // 获取评价统计信息
        Map<String, Object> stats = productReviewService.getReviewStats(id);
        
        // 获取评价分布
        List<Map<String, Object>> distribution = productReviewService.getRatingDistribution(id);
        
        // 组装返回结果
        Map<String, Object> result = Map.of(
                "reviews", reviewPage,
                "stats", stats,
                "distribution", distribution
        );
        
        return Result.ok(result);
    }
    
    @Operation(summary = "检查用户是否可以评价商品")
    @GetMapping("/{id}/review-eligibility")
    public Result<Map<String, Object>> checkReviewEligibility(
            @PathVariable Long id,
            @Parameter(description = "订单ID") @RequestParam(required = false) Long orderId) {
        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId == null) {
            return Result.ok(Map.of("canReview", false, "reason", "请先登录"));
        }
        
        // 允许用户对同一商品进行多次评价
        Map<String, Object> result = new HashMap<>();
        result.put("canReview", true);
        result.put("hasReviewed", false);
        result.put("reason", null);
        return Result.ok(result);
    }
}

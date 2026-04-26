package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.dto.AmapSyncRequest;
import com.cinema.booking.dto.AttractionDTO;
import com.cinema.booking.dto.CategoryDTO;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.entity.Attraction;
import com.cinema.booking.mapper.AttractionMapper;
import com.cinema.booking.service.AttractionService;
import com.cinema.booking.service.amap.AmapSyncService;
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
 * 景点控制器
 */
@Tag(name = "景点管理", description = "景点相关接口")
@RestController
@RequestMapping("/attractions")
@RequiredArgsConstructor
@Validated
public class AttractionController {
    
    private final AttractionService attractionService;
    private final AmapSyncService amapSyncService;
    private final AttractionMapper attractionMapper;
    
    @Operation(summary = "分页查询景点列表")
    @GetMapping("/page")
    public Result<IPage<AttractionDTO>> getAttractionPage(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "分类ID") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status) {
        
        PageRequest pageRequest = new PageRequest(pageNum, pageSize);
        IPage<AttractionDTO> page = attractionService.getAttractionPage(pageRequest, categoryId, keyword, status);
        return Result.ok(page);
    }
    
    @Operation(summary = "获取景点详情")
    @GetMapping("/{id}")
    public Result<AttractionDTO> getAttractionById(@PathVariable Long id) {
        AttractionDTO attraction = attractionService.getAttractionById(id);
        // 增加浏览次数
        attractionService.incrementViewCount(id);
        return Result.ok(attraction);
    }
    
    @Operation(summary = "创建景点")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "景点管理", operation = "创建景点", description = "创建新的景点信息")
    public Result<AttractionDTO> createAttraction(@Valid @RequestBody AttractionDTO attractionDTO) {
        AttractionDTO created = attractionService.createAttraction(attractionDTO);
        return Result.ok(created);
    }
    
    @Operation(summary = "更新景点")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "景点管理", operation = "更新景点", description = "更新景点信息")
    public Result<AttractionDTO> updateAttraction(@PathVariable Long id, @Valid @RequestBody AttractionDTO attractionDTO) {
        AttractionDTO updated = attractionService.updateAttraction(id, attractionDTO);
        return Result.ok(updated);
    }
    
    @Operation(summary = "删除景点")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "景点管理", operation = "删除景点", description = "删除景点信息")
    public Result<Void> deleteAttraction(@PathVariable Long id) {
        attractionService.deleteAttraction(id);
        return Result.ok();
    }

    @Operation(summary = "批量删除景点")
    @DeleteMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "景点管理", operation = "批量删除景点", description = "批量删除景点")
    public Result<Void> batchDeleteAttractions(@RequestBody List<Long> ids) {
        attractionMapper.deleteBatchIds(ids);
        return Result.ok();
    }

    @Operation(summary = "批量更新景点状态")
    @PutMapping("/batch/status")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "景点管理", operation = "批量更新景点状态", description = "批量启用/禁用景点")
    public Result<Void> batchUpdateAttractionStatus(@RequestBody Map<String, Object> params) {
        @SuppressWarnings("unchecked")
        List<Long> ids = (List<Long>) params.get("ids");
        Integer status = (Integer) params.get("status");
        LambdaUpdateWrapper<Attraction> wrapper = new LambdaUpdateWrapper<>();
        wrapper.in(Attraction::getId, ids).set(Attraction::getStatus, status);
        attractionMapper.update(null, wrapper);
        return Result.ok();
    }
    
    @Operation(summary = "获取推荐景点列表")
    @GetMapping("/recommend")
    public Result<List<AttractionDTO>> getRecommendAttractions(
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "6") Integer limit) {
        List<AttractionDTO> attractions = attractionService.getRecommendAttractions(limit);
        return Result.ok(attractions);
    }
    
    @Operation(summary = "获取热门景点列表")
    @GetMapping("/hot")
    public Result<List<AttractionDTO>> getHotAttractions(
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "6") Integer limit) {
        List<AttractionDTO> attractions = attractionService.getHotAttractions(limit);
        return Result.ok(attractions);
    }
    
    @Operation(summary = "获取精选景点列表")
    @GetMapping("/featured")
    public Result<List<AttractionDTO>> getFeaturedAttractions(
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "6") Integer limit) {
        // 使用推荐景点作为精选景点
        List<AttractionDTO> attractions = attractionService.getRecommendAttractions(limit);
        return Result.ok(attractions);
    }
    
    @Operation(summary = "根据分类获取景点列表")
    @GetMapping("/category/{categoryId}")
    public Result<List<AttractionDTO>> getAttractionsByCategory(@PathVariable Long categoryId) {
        List<AttractionDTO> attractions = attractionService.getAttractionsByCategory(categoryId);
        return Result.ok(attractions);
    }
    
    @Operation(summary = "获取景点分类列表")
    @GetMapping("/categories")
    public Result<List<CategoryDTO>> getAttractionCategories() {
        List<CategoryDTO> categories = attractionService.getAttractionCategories();
        return Result.ok(categories);
    }
    
    @Operation(summary = "创建景点分类")
    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "景点管理", operation = "创建分类", description = "创建景点分类")
    public Result<CategoryDTO> createAttractionCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO created = attractionService.createAttractionCategory(categoryDTO);
        return Result.ok(created);
    }
    
    @Operation(summary = "更新景点分类")
    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "景点管理", operation = "更新分类", description = "更新景点分类")
    public Result<CategoryDTO> updateAttractionCategory(@PathVariable Long id, @Valid @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO updated = attractionService.updateAttractionCategory(id, categoryDTO);
        return Result.ok(updated);
    }
    
    @Operation(summary = "删除景点分类")
    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "景点管理", operation = "删除分类", description = "删除景点分类")
    public Result<Void> deleteAttractionCategory(@PathVariable Long id) {
        attractionService.deleteAttractionCategory(id);
        return Result.ok();
    }

    @Operation(summary = "从高德地图同步景点数据")
    @PostMapping("/sync")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "景点管理", operation = "同步景点数据", description = "从高德地图API同步景点数据")
    public Result<Map<String, Object>> syncFromAmap(@Valid @RequestBody AmapSyncRequest request) {
        AmapSyncService.SyncResult result = amapSyncService.syncFromAmap(
                request.getRegion(), request.getKeyword(), request.getMaxPages()
        );
        return Result.ok(Map.of(
                "inserted", result.inserted(),
                "updated", result.updated(),
                "skipped", result.skipped()
        ));
    }
}

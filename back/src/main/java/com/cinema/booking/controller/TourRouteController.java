package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.dto.TourRouteDTO;
import com.cinema.booking.service.TourRouteService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "旅游路线管理", description = "旅游路线相关接口")
@RestController
@RequestMapping("/tour-routes")
@RequiredArgsConstructor
public class TourRouteController {

    private final TourRouteService tourRouteService;

    @Operation(summary = "分页查询路线列表")
    @GetMapping("/page")
    public Result<IPage<TourRouteDTO>> getRoutePage(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "9") Integer pageSize,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "难度") @RequestParam(required = false) String difficulty,
            @Parameter(description = "天数") @RequestParam(required = false) Integer days,
            @Parameter(description = "标签") @RequestParam(required = false) String tag,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status) {
        PageRequest pageRequest = new PageRequest(pageNum, pageSize);
        return Result.ok(tourRouteService.getRoutePage(pageRequest, keyword, difficulty, days, tag, status));
    }

    @Operation(summary = "获取路线详情")
    @GetMapping("/{id}")
    public Result<TourRouteDTO> getRouteById(@PathVariable Long id) {
        TourRouteDTO route = tourRouteService.getRouteById(id);
        tourRouteService.incrementViewCount(id);
        return Result.ok(route);
    }

    @Operation(summary = "获取推荐路线")
    @GetMapping("/recommend")
    public Result<List<TourRouteDTO>> getRecommendRoutes(
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "3") Integer limit) {
        return Result.ok(tourRouteService.getRecommendRoutes(limit));
    }

    @Operation(summary = "创建路线")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<TourRouteDTO> createRoute(@RequestBody TourRouteDTO routeDTO) {
        return Result.ok(tourRouteService.createRoute(routeDTO));
    }

    @Operation(summary = "更新路线")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<TourRouteDTO> updateRoute(@PathVariable Long id, @RequestBody TourRouteDTO routeDTO) {
        return Result.ok(tourRouteService.updateRoute(id, routeDTO));
    }

    @Operation(summary = "删除路线")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteRoute(@PathVariable Long id) {
        tourRouteService.deleteRoute(id);
        return Result.ok();
    }
}

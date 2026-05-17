package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.dto.TourRouteDTO;
import com.cinema.booking.security.SecurityService;
import com.cinema.booking.service.TourRouteService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Tag(name = "旅游路线管理", description = "旅游路线相关接口")
@RestController
@RequestMapping("/tour-routes")
@RequiredArgsConstructor
public class TourRouteController {

    private final TourRouteService tourRouteService;
    private final SecurityService securityService;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String FAV_USER_SET = "route:fav:user:";
    private static final String FAV_COUNT_KEY = "route:favCount:";

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

    @Operation(summary = "收藏/取消收藏 路线（基于 Redis）")
    @PostMapping("/{id}/favorite")
    @PreAuthorize("isAuthenticated()")
    public Result<Map<String, Object>> toggleRouteFavorite(@PathVariable Long id) {
        Long userId = securityService.getCurrentUserId();
        String userSetKey = FAV_USER_SET + userId;
        String countKey = FAV_COUNT_KEY + id;
        Boolean isMember = redisTemplate.opsForSet().isMember(userSetKey, String.valueOf(id));
        boolean favorited;
        long count;
        if (Boolean.TRUE.equals(isMember)) {
            redisTemplate.opsForSet().remove(userSetKey, String.valueOf(id));
            Long c = redisTemplate.opsForValue().decrement(countKey);
            if (c != null && c < 0) {
                redisTemplate.opsForValue().set(countKey, "0");
                count = 0L;
            } else {
                count = c == null ? 0L : c;
            }
            favorited = false;
        } else {
            redisTemplate.opsForSet().add(userSetKey, String.valueOf(id));
            Long c = redisTemplate.opsForValue().increment(countKey);
            count = c == null ? 1L : c;
            favorited = true;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("favorited", favorited);
        data.put("favoriteCount", count);
        return Result.ok(data);
    }

    @Operation(summary = "查询当前用户对路线的收藏状态")
    @GetMapping("/{id}/favorite-info")
    public Result<Map<String, Object>> getRouteFavoriteInfo(@PathVariable Long id) {
        Long userId = null;
        try {
            userId = securityService.getCurrentUserId();
        } catch (Exception ignore) { /* 未登录 */ }
        String countKey = FAV_COUNT_KEY + id;
        String countStr = redisTemplate.opsForValue().get(countKey);
        long count = 0L;
        if (countStr != null) {
            try { count = Long.parseLong(countStr); } catch (NumberFormatException ignore) {}
        }
        boolean favorited = false;
        if (userId != null) {
            Boolean m = redisTemplate.opsForSet().isMember(FAV_USER_SET + userId, String.valueOf(id));
            favorited = Boolean.TRUE.equals(m);
        }
        Map<String, Object> data = new HashMap<>();
        data.put("favorited", favorited);
        data.put("favoriteCount", count);
        return Result.ok(data);
    }

    @Operation(summary = "获取当前用户收藏的路线ID列表")
    @GetMapping("/favorites/my")
    @PreAuthorize("isAuthenticated()")
    public Result<List<Long>> getMyFavoriteRouteIds() {
        Long userId = securityService.getCurrentUserId();
        Set<String> members = redisTemplate.opsForSet().members(FAV_USER_SET + userId);
        if (members == null || members.isEmpty()) {
            return Result.ok(java.util.Collections.emptyList());
        }
        List<Long> ids = members.stream()
                .map(s -> {
                    try { return Long.parseLong(s); } catch (NumberFormatException e) { return null; }
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
        return Result.ok(ids);
    }
}

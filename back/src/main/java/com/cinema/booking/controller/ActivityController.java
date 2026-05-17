package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.dto.ActivityDTO;
import com.cinema.booking.dto.ActivityRegistrationDTO;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.security.SecurityService;
import com.cinema.booking.service.ActivityService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "活动管理", description = "乡村活动与报名接口")
@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;
    private final SecurityService securityService;

    @Operation(summary = "分页查询活动列表")
    @GetMapping("/page")
    public Result<IPage<ActivityDTO>> getActivityPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        return Result.ok(activityService.getActivityPage(new PageRequest(pageNum, pageSize), keyword, category, status));
    }

    @Operation(summary = "获取活动详情")
    @GetMapping("/{id}")
    public Result<ActivityDTO> getActivityById(@PathVariable Long id) {
        return Result.ok(activityService.getActivityById(id));
    }

    @Operation(summary = "按日期查询活动")
    @GetMapping("/date")
    public Result<List<ActivityDTO>> getActivitiesByDate(@RequestParam String date) {
        return Result.ok(activityService.getActivitiesByDate(date));
    }

    @Operation(summary = "按月份查询活动")
    @GetMapping("/calendar")
    public Result<List<ActivityDTO>> getMonthActivities(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        return Result.ok(activityService.getMonthActivities(year, month));
    }

    @Operation(summary = "活动报名")
    @PostMapping("/register")
    @SystemOperation(module = "活动管理", operation = "活动报名", description = "用户提交活动报名")
    public Result<ActivityRegistrationDTO> registerActivity(@Valid @RequestBody ActivityRegistrationDTO dto) {
        return Result.ok(activityService.registerActivity(dto));
    }

    @Operation(summary = "获取相关活动")
    @GetMapping("/{id}/related")
    public Result<List<ActivityDTO>> getRelatedActivities(
            @PathVariable Long id,
            @RequestParam(defaultValue = "3") Integer limit) {
        return Result.ok(activityService.getRelatedActivities(id, limit));
    }

    @Operation(summary = "创建活动")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "活动管理", operation = "创建活动", description = "管理员创建活动")
    public Result<ActivityDTO> createActivity(@Valid @RequestBody ActivityDTO dto) {
        return Result.ok(activityService.createActivity(dto));
    }

    @Operation(summary = "更新活动")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "活动管理", operation = "更新活动", description = "管理员更新活动")
    public Result<ActivityDTO> updateActivity(@PathVariable Long id, @Valid @RequestBody ActivityDTO dto) {
        return Result.ok(activityService.updateActivity(id, dto));
    }

    @Operation(summary = "删除活动")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "活动管理", operation = "删除活动", description = "管理员删除活动")
    public Result<Void> deleteActivity(@PathVariable Long id) {
        activityService.deleteActivity(id);
        return Result.ok();
    }

    @Operation(summary = "分页查询活动报名")
    @GetMapping("/registrations/page")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<IPage<ActivityRegistrationDTO>> getRegistrationPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long activityId,
            @Parameter(description = "报名状态") @RequestParam(required = false) String status) {
        return Result.ok(activityService.getRegistrationPage(new PageRequest(pageNum, pageSize), activityId, status));
    }

    @Operation(summary = "确认报名")
    @PutMapping("/registrations/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "活动管理", operation = "确认报名", description = "管理员确认活动报名")
    public Result<Void> confirmRegistration(@PathVariable Long id) {
        activityService.confirmRegistration(id);
        return Result.ok();
    }

    @Operation(summary = "取消报名")
    @PutMapping("/registrations/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "活动管理", operation = "取消报名", description = "管理员取消活动报名")
    public Result<Void> cancelRegistration(@PathVariable Long id) {
        activityService.cancelRegistration(id);
        return Result.ok();
    }

    @Operation(summary = "用户取消我的报名")
    @DeleteMapping("/registrations/{id}/self")
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "活动管理", operation = "取消我的报名", description = "用户取消自己的活动报名")
    public Result<Void> cancelMyRegistration(@PathVariable Long id) {
        Long userId = securityService.getCurrentUserId();
        activityService.cancelMyRegistration(id, userId);
        return Result.ok();
    }

    @Operation(summary = "查询我的活动报名")
    @GetMapping("/registrations/my")
    @PreAuthorize("isAuthenticated()")
    public Result<IPage<ActivityRegistrationDTO>> getMyRegistrations(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String status) {
        Long userId = securityService.getCurrentUserId();
        return Result.ok(activityService.getMyRegistrations(new PageRequest(pageNum, pageSize), userId, status));
    }
}

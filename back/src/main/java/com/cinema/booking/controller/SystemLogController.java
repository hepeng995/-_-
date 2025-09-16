package com.cinema.booking.controller;

import com.cinema.booking.model.dto.SystemLogDTO;
import com.cinema.booking.model.entity.SystemLog;
import com.cinema.booking.model.query.SystemLogQuery;
import com.cinema.booking.service.SystemLogService;
import com.cinema.booking.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 系统日志控制器
 */
@RestController
@RequestMapping("/system/logs")
public class SystemLogController {

    @Autowired
    private SystemLogService systemLogService;

    /**
     * 获取系统日志分页列表
     *
     * @param query 查询参数
     * @return 日志分页数据
     */
    @GetMapping("/page")
    public Result<Object> getSystemLogPage(SystemLogQuery query) {
        return Result.success(systemLogService.getSystemLogPage(query));
    }

    /**
     * 获取系统日志详情
     *
     * @param id 日志ID
     * @return 日志详情
     */
    @GetMapping("/{id}")
    public Result<SystemLogDTO> getSystemLogDetail(@PathVariable Long id) {
        SystemLogDTO log = systemLogService.getSystemLogById(id);
        if (log == null) {
            return Result.fail("日志不存在");
        }
        return Result.success(log);
    }

    /**
     * 删除系统日志
     *
     * @param id 日志ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteSystemLog(@PathVariable Long id) {
        boolean result = systemLogService.deleteSystemLog(id);
        return result ? Result.success() : Result.fail("删除失败");
    }

    /**
     * 批量删除系统日志
     *
     * @param ids 日志ID列表
     * @return 操作结果
     */
    @DeleteMapping("/batch")
    public Result<Void> batchDeleteSystemLogs(@RequestBody List<Long> ids) {
        boolean result = systemLogService.batchDeleteSystemLogs(ids);
        return result ? Result.success() : Result.fail("批量删除失败");
    }

    /**
     * 清空系统日志
     *
     * @return 操作结果
     */
    @DeleteMapping("/clear")
    public Result<Void> clearSystemLogs() {
        boolean result = systemLogService.clearSystemLogs();
        return result ? Result.success() : Result.fail("清空失败");
    }

    /**
     * 导出系统日志
     *
     * @param query    查询参数
     * @param response HTTP响应
     */
    @GetMapping("/export")
    public void exportSystemLogs(SystemLogQuery query, HttpServletResponse response) {
        systemLogService.exportSystemLogs(query);
    }

    /**
     * 获取操作类型列表
     *
     * @return 操作类型列表
     */
    @GetMapping("/operation-types")
    public Result<List<String>> getOperationTypes() {
        List<String> types = systemLogService.getOperationTypes();
        return Result.success(types);
    }

    /**
     * 获取模块列表
     *
     * @return 模块列表
     */
    @GetMapping("/modules")
    public Result<List<String>> getModules() {
        List<String> modules = systemLogService.getModules();
        return Result.success(modules);
    }

    /**
     * 获取操作统计数据
     *
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @return 统计数据
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getOperationStats(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endTime) {
        Map<String, Object> stats = systemLogService.getOperationStats(startTime, endTime);
        return Result.success(stats);
    }
} 
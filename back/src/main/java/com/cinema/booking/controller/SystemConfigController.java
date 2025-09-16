package com.cinema.booking.controller;

import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.model.dto.SystemConfigDTO;
import com.cinema.booking.model.entity.SystemConfig;
import com.cinema.booking.service.SystemConfigService;
import com.cinema.booking.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 系统配置控制器
 */
@RestController
@RequestMapping("/system/config")
public class SystemConfigController {

    @Autowired
    private SystemConfigService systemConfigService;

    /**
     * 获取所有系统配置
     *
     * @return 配置列表
     */
    @GetMapping("/list")
    public Result<List<SystemConfigDTO>> getAllConfigs() {
        return Result.success(systemConfigService.getAllConfigs());
    }

    /**
     * 按分组获取系统配置
     *
     * @return 分组配置
     */
    @GetMapping("/group")
    public Result<Map<String, List<SystemConfigDTO>>> getConfigsByGroup() {
        return Result.success(systemConfigService.getConfigsByGroup());
    }

    /**
     * 获取指定分组的配置
     *
     * @param groupName 分组名称
     * @return 配置列表
     */
    @GetMapping("/group/{groupName}")
    public Result<List<SystemConfigDTO>> getConfigsByGroupName(@PathVariable String groupName) {
        return Result.success(systemConfigService.getConfigsByGroupName(groupName));
    }

    /**
     * 获取所有配置分组
     *
     * @return 分组列表
     */
    @GetMapping("/groups")
    public Result<List<String>> getAllGroups() {
        return Result.success(systemConfigService.getAllGroups());
    }

    /**
     * 根据键名获取配置
     *
     * @param configKey 配置键名
     * @return 配置信息
     */
    @GetMapping("/{configKey}")
    public Result<SystemConfigDTO> getConfigByKey(@PathVariable String configKey) {
        SystemConfigDTO config = systemConfigService.getConfigByKey(configKey);
        if (config == null) {
            return Result.fail("配置不存在");
        }
        return Result.success(config);
    }

    /**
     * 新增配置
     *
     * @param config 配置信息
     * @return 操作结果
     */
    @PostMapping
    @SystemOperation(module = "系统设置", operation = "新增配置", description = "新增系统配置")
    public Result<Void> addConfig(@RequestBody SystemConfig config) {
        boolean result = systemConfigService.addConfig(config);
        return result ? Result.success() : Result.fail("新增配置失败");
    }

    /**
     * 更新配置
     *
     * @param config 配置信息
     * @return 操作结果
     */
    @PutMapping
    @SystemOperation(module = "系统设置", operation = "更新配置", description = "更新系统配置")
    public Result<Void> updateConfig(@RequestBody SystemConfig config) {
        boolean result = systemConfigService.updateConfig(config);
        return result ? Result.success() : Result.fail("更新配置失败");
    }

    /**
     * 更新配置值
     *
     * @param configKey   配置键名
     * @param configValue 配置值
     * @return 操作结果
     */
    @PutMapping("/{configKey}")
    @SystemOperation(module = "系统设置", operation = "更新配置值", description = "更新系统配置值")
    public Result<Void> updateConfigValue(@PathVariable String configKey, @RequestParam String configValue) {
        boolean result = systemConfigService.updateConfigValue(configKey, configValue);
        return result ? Result.success() : Result.fail("更新配置值失败");
    }

    /**
     * 批量更新配置值
     *
     * @param configs 配置键值对
     * @return 操作结果
     */
    @PutMapping("/batch")
    @SystemOperation(module = "系统设置", operation = "批量更新配置", description = "批量更新系统配置")
    public Result<Void> batchUpdateConfigValues(@RequestBody Map<String, String> configs) {
        boolean result = systemConfigService.batchUpdateConfigValues(configs);
        return result ? Result.success() : Result.fail("批量更新配置失败");
    }

    /**
     * 删除配置
     *
     * @param id 配置ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    @SystemOperation(module = "系统设置", operation = "删除配置", description = "删除系统配置")
    public Result<Void> deleteConfig(@PathVariable Long id) {
        boolean result = systemConfigService.deleteConfig(id);
        return result ? Result.success() : Result.fail("删除配置失败");
    }

    /**
     * 刷新配置缓存
     *
     * @return 操作结果
     */
    @PostMapping("/refresh")
    @SystemOperation(module = "系统设置", operation = "刷新配置缓存", description = "刷新系统配置缓存")
    public Result<Void> refreshCache() {
        systemConfigService.refreshCache();
        return Result.success();
    }
} 
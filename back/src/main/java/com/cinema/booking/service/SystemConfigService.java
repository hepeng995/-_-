package com.cinema.booking.service;

import com.cinema.booking.model.dto.SystemConfigDTO;
import com.cinema.booking.model.entity.SystemConfig;
import java.util.List;
import java.util.Map;

/**
 * 系统配置服务接口
 */
public interface SystemConfigService {

    /**
     * 获取所有配置
     *
     * @return 配置列表
     */
    List<SystemConfigDTO> getAllConfigs();

    /**
     * 按分组获取配置
     *
     * @return 分组配置
     */
    Map<String, List<SystemConfigDTO>> getConfigsByGroup();

    /**
     * 获取指定分组的配置
     *
     * @param groupName 分组名称
     * @return 配置列表
     */
    List<SystemConfigDTO> getConfigsByGroupName(String groupName);

    /**
     * 获取所有分组
     *
     * @return 分组列表
     */
    List<String> getAllGroups();

    /**
     * 根据键名获取配置
     *
     * @param configKey 配置键名
     * @return 配置信息
     */
    SystemConfigDTO getConfigByKey(String configKey);

    /**
     * 根据键名获取配置值
     *
     * @param configKey 配置键名
     * @return 配置值
     */
    String getConfigValue(String configKey);

    /**
     * 新增配置
     *
     * @param config 配置信息
     * @return 是否成功
     */
    boolean addConfig(SystemConfig config);

    /**
     * 更新配置
     *
     * @param config 配置信息
     * @return 是否成功
     */
    boolean updateConfig(SystemConfig config);

    /**
     * 更新配置值
     *
     * @param configKey   配置键名
     * @param configValue 配置值
     * @return 是否成功
     */
    boolean updateConfigValue(String configKey, String configValue);

    /**
     * 批量更新配置值
     *
     * @param configs 配置列表
     * @return 是否成功
     */
    boolean batchUpdateConfigValues(Map<String, String> configs);

    /**
     * 删除配置
     *
     * @param id 配置ID
     * @return 是否成功
     */
    boolean deleteConfig(Long id);

    /**
     * 刷新配置缓存
     */
    void refreshCache();
} 
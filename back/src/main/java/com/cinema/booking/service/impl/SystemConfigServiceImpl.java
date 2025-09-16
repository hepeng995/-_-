package com.cinema.booking.service.impl;

import com.cinema.booking.mapper.SystemConfigMapper;
import com.cinema.booking.model.dto.SystemConfigDTO;
import com.cinema.booking.model.entity.SystemConfig;
import com.cinema.booking.service.SystemConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 系统配置服务实现类
 */
@Slf4j
@Service
public class SystemConfigServiceImpl implements SystemConfigService {

    @Autowired
    private SystemConfigMapper systemConfigMapper;

    // 本地缓存，提高访问速度
    private static final Map<String, String> CONFIG_CACHE = new ConcurrentHashMap<>();

    @Override
    @Cacheable(value = "systemConfig", key = "'allConfigs'")
    public List<SystemConfigDTO> getAllConfigs() {
        log.info("获取所有系统配置");
        List<SystemConfig> configs = systemConfigMapper.selectAll();
        return convertToDTOList(configs);
    }

    @Override
    @Cacheable(value = "systemConfig", key = "'configsByGroup'")
    public Map<String, List<SystemConfigDTO>> getConfigsByGroup() {
        log.info("按分组获取系统配置");
        List<SystemConfigDTO> allConfigs = getAllConfigs();
        
        return allConfigs.stream()
                .collect(Collectors.groupingBy(SystemConfigDTO::getGroupName));
    }

    @Override
    @Cacheable(value = "systemConfig", key = "'group:' + #groupName")
    public List<SystemConfigDTO> getConfigsByGroupName(String groupName) {
        log.info("获取分组[{}]的系统配置", groupName);
        List<SystemConfig> configs = systemConfigMapper.selectByGroup(groupName);
        return convertToDTOList(configs);
    }

    @Override
    @Cacheable(value = "systemConfig", key = "'allGroups'")
    public List<String> getAllGroups() {
        log.info("获取所有配置分组");
        return systemConfigMapper.selectAllGroups();
    }

    @Override
    @Cacheable(value = "systemConfig", key = "'config:' + #configKey")
    public SystemConfigDTO getConfigByKey(String configKey) {
        log.info("根据键名[{}]获取配置", configKey);
        SystemConfig config = systemConfigMapper.selectByKey(configKey);
        if (config == null) {
            return null;
        }
        return convertToDTO(config);
    }

    @Override
    public String getConfigValue(String configKey) {
        // 先从本地缓存获取
        String value = CONFIG_CACHE.get(configKey);
        if (value != null) {
            return value;
        }
        
        // 从数据库获取
        SystemConfig config = systemConfigMapper.selectByKey(configKey);
        if (config != null) {
            // 放入本地缓存
            CONFIG_CACHE.put(configKey, config.getConfigValue());
            return config.getConfigValue();
        }
        
        return null;
    }

    @Override
    @Transactional
    @CacheEvict(value = "systemConfig", allEntries = true)
    public boolean addConfig(SystemConfig config) {
        log.info("新增配置: {}", config.getConfigKey());
        try {
            int rows = systemConfigMapper.insert(config);
            if (rows > 0) {
                // 更新本地缓存
                CONFIG_CACHE.put(config.getConfigKey(), config.getConfigValue());
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("新增配置失败: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "systemConfig", allEntries = true)
    public boolean updateConfig(SystemConfig config) {
        log.info("更新配置: {}", config.getConfigKey());
        try {
            int rows = systemConfigMapper.update(config);
            if (rows > 0) {
                // 更新本地缓存
                CONFIG_CACHE.put(config.getConfigKey(), config.getConfigValue());
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("更新配置失败: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "systemConfig", allEntries = true)
    public boolean updateConfigValue(String configKey, String configValue) {
        log.info("更新配置值: key={}, value={}", configKey, configValue);
        try {
            int rows = systemConfigMapper.updateValueByKey(configKey, configValue);
            if (rows > 0) {
                // 更新本地缓存
                CONFIG_CACHE.put(configKey, configValue);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("更新配置值失败: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "systemConfig", allEntries = true)
    public boolean batchUpdateConfigValues(Map<String, String> configs) {
        log.info("批量更新配置值, 数量: {}", configs.size());
        try {
            List<SystemConfig> configList = new ArrayList<>();
            configs.forEach((key, value) -> {
                SystemConfig config = new SystemConfig();
                config.setConfigKey(key);
                config.setConfigValue(value);
                configList.add(config);
            });
            
            int rows = systemConfigMapper.batchUpdateValue(configList);
            if (rows > 0) {
                // 更新本地缓存
                configs.forEach(CONFIG_CACHE::put);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("批量更新配置值失败: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "systemConfig", allEntries = true)
    public boolean deleteConfig(Long id) {
        log.info("删除配置: id={}", id);
        try {
            // 先查询配置信息
            SystemConfig config = systemConfigMapper.selectByKey(String.valueOf(id));
            if (config != null) {
                int rows = systemConfigMapper.deleteById(id);
                if (rows > 0) {
                    // 移除本地缓存
                    CONFIG_CACHE.remove(config.getConfigKey());
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            log.error("删除配置失败: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @CacheEvict(value = "systemConfig", allEntries = true)
    public void refreshCache() {
        log.info("刷新系统配置缓存");
        // 清空本地缓存
        CONFIG_CACHE.clear();
        
        // 重新加载
        List<SystemConfig> configs = systemConfigMapper.selectAll();
        for (SystemConfig config : configs) {
            CONFIG_CACHE.put(config.getConfigKey(), config.getConfigValue());
        }
        log.info("刷新系统配置缓存完成, 共加载{}条配置", configs.size());
    }

    /**
     * 将实体转换为DTO
     */
    private SystemConfigDTO convertToDTO(SystemConfig config) {
        if (config == null) {
            return null;
        }
        
        SystemConfigDTO dto = new SystemConfigDTO();
        BeanUtils.copyProperties(config, dto);
        
        // 处理select类型的选项
        if ("select".equals(config.getConfigType()) && config.getConfigOptions() != null) {
            List<Map<String, String>> options = new ArrayList<>();
            String[] optionPairs = config.getConfigOptions().split(",");
            for (String pair : optionPairs) {
                String[] keyValue = pair.split(":");
                if (keyValue.length == 2) {
                    Map<String, String> option = new HashMap<>();
                    option.put("value", keyValue[0]);
                    option.put("label", keyValue[1]);
                    options.add(option);
                }
            }
            dto.setOptions(options);
        }
        
        return dto;
    }

    /**
     * 将实体列表转换为DTO列表
     */
    private List<SystemConfigDTO> convertToDTOList(List<SystemConfig> configs) {
        if (configs == null) {
            return Collections.emptyList();
        }
        
        return configs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
} 
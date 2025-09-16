package com.cinema.booking.mapper;

import com.cinema.booking.model.entity.SystemConfig;
import org.apache.ibatis.annotations.*;
import java.util.List;

/**
 * 系统配置Mapper接口
 */
@Mapper
public interface SystemConfigMapper {

    /**
     * 查询所有配置项
     *
     * @return 配置列表
     */
    @Select("SELECT * FROM system_config ORDER BY group_name, sort, id")
    List<SystemConfig> selectAll();

    /**
     * 根据分组查询配置项
     *
     * @param groupName 分组名称
     * @return 配置列表
     */
    @Select("SELECT * FROM system_config WHERE group_name = #{groupName} ORDER BY sort, id")
    List<SystemConfig> selectByGroup(String groupName);

    /**
     * 根据配置键名查询配置项
     *
     * @param configKey 配置键名
     * @return 配置信息
     */
    @Select("SELECT * FROM system_config WHERE config_key = #{configKey}")
    SystemConfig selectByKey(String configKey);

    /**
     * 查询所有配置分组
     *
     * @return 分组列表
     */
    @Select("SELECT DISTINCT group_name FROM system_config ORDER BY group_name")
    List<String> selectAllGroups();

    /**
     * 新增配置
     *
     * @param config 配置信息
     * @return 影响行数
     */
    @Insert("INSERT INTO system_config(config_key, config_value, config_name, config_type, config_options, group_name, sort, remark) " +
            "VALUES(#{configKey}, #{configValue}, #{configName}, #{configType}, #{configOptions}, #{groupName}, #{sort}, #{remark})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(SystemConfig config);

    /**
     * 修改配置
     *
     * @param config 配置信息
     * @return 影响行数
     */
    @Update("UPDATE system_config SET config_value = #{configValue}, config_name = #{configName}, " +
            "config_type = #{configType}, config_options = #{configOptions}, group_name = #{groupName}, " +
            "sort = #{sort}, remark = #{remark} WHERE id = #{id}")
    int update(SystemConfig config);

    /**
     * 修改配置值
     *
     * @param configKey   配置键
     * @param configValue 配置值
     * @return 影响行数
     */
    @Update("UPDATE system_config SET config_value = #{configValue} WHERE config_key = #{configKey}")
    int updateValueByKey(@Param("configKey") String configKey, @Param("configValue") String configValue);

    /**
     * 批量更新配置值
     *
     * @param configs 配置列表
     * @return 影响行数
     */
    @Update("<script>" +
            "<foreach collection='list' item='item' separator=';'>" +
            "UPDATE system_config SET config_value = #{item.configValue} WHERE config_key = #{item.configKey}" +
            "</foreach>" +
            "</script>")
    int batchUpdateValue(List<SystemConfig> configs);

    /**
     * 删除配置
     *
     * @param id 配置ID
     * @return 影响行数
     */
    @Delete("DELETE FROM system_config WHERE id = #{id}")
    int deleteById(Long id);

    /**
     * 根据键名删除配置
     *
     * @param configKey 配置键名
     * @return 影响行数
     */
    @Delete("DELETE FROM system_config WHERE config_key = #{configKey}")
    int deleteByKey(String configKey);
} 
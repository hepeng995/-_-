package com.cinema.booking.model.entity;

import lombok.Data;
import java.util.Date;

/**
 * 系统配置实体类
 */
@Data
public class SystemConfig {
    /**
     * 配置ID
     */
    private Long id;

    /**
     * 配置键名
     */
    private String configKey;

    /**
     * 配置键值
     */
    private String configValue;

    /**
     * 配置名称
     */
    private String configName;

    /**
     * 配置类型(text/number/boolean/select/date)
     */
    private String configType;

    /**
     * 配置可选项，用于select类型
     */
    private String configOptions;

    /**
     * 分组名称
     */
    private String groupName;

    /**
     * 排序
     */
    private Integer sort;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    private Date createdAt;

    /**
     * 更新时间
     */
    private Date updatedAt;
} 
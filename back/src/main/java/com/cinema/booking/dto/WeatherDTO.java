package com.cinema.booking.dto;

import lombok.Data;

/**
 * 实时天气DTO
 */
@Data
public class WeatherDTO {

    private Long attractionId;

    /** 当前温度 */
    private String temp;

    /** 体感温度 */
    private String feelsLike;

    /** 天气描述（晴、多云等） */
    private String text;

    /** 和风天气图标代码 */
    private String icon;

    /** 风向 */
    private String windDir;

    /** 风力等级 */
    private String windScale;

    /** 湿度 */
    private String humidity;

    /** 数据更新时间 */
    private String updateTime;
}

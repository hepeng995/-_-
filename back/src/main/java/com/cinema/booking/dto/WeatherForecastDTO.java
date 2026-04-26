package com.cinema.booking.dto;

import lombok.Data;

/**
 * 天气预报DTO（3日预报）
 */
@Data
public class WeatherForecastDTO {

    /** 日期 */
    private String date;

    /** 最高温度 */
    private String tempMax;

    /** 最低温度 */
    private String tempMin;

    /** 白天天气描述 */
    private String textDay;

    /** 夜间天气描述 */
    private String textNight;

    /** 白天天气图标代码 */
    private String iconDay;

    /** 夜间天气图标代码 */
    private String iconNight;
}

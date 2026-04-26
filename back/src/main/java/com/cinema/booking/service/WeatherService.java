package com.cinema.booking.service;

import com.cinema.booking.dto.WeatherDTO;
import com.cinema.booking.dto.WeatherForecastDTO;

import java.util.List;

/**
 * 天气服务接口
 */
public interface WeatherService {

    /**
     * 获取景点实时天气
     * @param attractionId 景点ID
     * @return 实时天气
     */
    WeatherDTO getWeatherNow(Long attractionId);

    /**
     * 获取景点3日天气预报
     * @param attractionId 景点ID
     * @return 3日预报列表
     */
    List<WeatherForecastDTO> getWeatherForecast(Long attractionId);
}

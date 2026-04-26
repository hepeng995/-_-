package com.cinema.booking.controller;

import com.cinema.booking.dto.WeatherDTO;
import com.cinema.booking.dto.WeatherForecastDTO;
import com.cinema.booking.service.WeatherService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 天气控制器
 */
@Tag(name = "天气服务", description = "景点天气相关接口")
@RestController
@RequestMapping("/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @Operation(summary = "获取景点实时天气")
    @GetMapping("/now/{attractionId}")
    public Result<WeatherDTO> getWeatherNow(
            @Parameter(description = "景点ID") @PathVariable Long attractionId) {
        return Result.success(weatherService.getWeatherNow(attractionId));
    }

    @Operation(summary = "获取景点3日天气预报")
    @GetMapping("/forecast/{attractionId}")
    public Result<List<WeatherForecastDTO>> getWeatherForecast(
            @Parameter(description = "景点ID") @PathVariable Long attractionId) {
        return Result.success(weatherService.getWeatherForecast(attractionId));
    }
}

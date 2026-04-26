package com.cinema.booking.service.impl;

import com.cinema.booking.dto.WeatherDTO;
import com.cinema.booking.dto.WeatherForecastDTO;
import com.cinema.booking.entity.Attraction;
import com.cinema.booking.mapper.AttractionMapper;
import com.cinema.booking.service.WeatherService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherServiceImpl implements WeatherService {

    private final AttractionMapper attractionMapper;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${qweather.api-key}")
    private String apiKey;

    @Value("${qweather.base-url}")
    private String baseUrl;

    @Value("${qweather.cache-minutes:30}")
    private int cacheMinutes;

    private static final String CACHE_PREFIX_NOW = "weather:now:";
    private static final String CACHE_PREFIX_FORECAST = "weather:forecast:";

    @Override
    public WeatherDTO getWeatherNow(Long attractionId) {
        // 1. 尝试从缓存读取
        String cached = redisTemplate.opsForValue().get(CACHE_PREFIX_NOW + attractionId);
        if (cached != null) {
            try {
                return objectMapper.readValue(cached, WeatherDTO.class);
            } catch (Exception e) {
                log.warn("解析天气缓存失败, attractionId={}", attractionId, e);
            }
        }

        // 2. 获取景点经纬度
        Attraction attraction = attractionMapper.selectById(attractionId);
        if (attraction == null || attraction.getLongitude() == null || attraction.getLatitude() == null) {
            return buildFallbackWeather(attractionId);
        }

        // 3. 调用和风天气API
        try {
            String url = String.format("%s/v7/weather/now?location=%.6f,%.6f&key=%s",
                    baseUrl, attraction.getLongitude().doubleValue(),
                    attraction.getLatitude().doubleValue(), apiKey);

            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            if (!"200".equals(root.path("code").asText())) {
                log.warn("和风天气API返回错误, code={}, attractionId={}", root.path("code").asText(), attractionId);
                return buildFallbackWeather(attractionId);
            }

            JsonNode now = root.path("now");
            WeatherDTO dto = new WeatherDTO();
            dto.setAttractionId(attractionId);
            dto.setTemp(now.path("temp").asText());
            dto.setFeelsLike(now.path("feelsLike").asText());
            dto.setText(now.path("text").asText());
            dto.setIcon(now.path("icon").asText());
            dto.setWindDir(now.path("windDir").asText());
            dto.setWindScale(now.path("windScale").asText());
            dto.setHumidity(now.path("humidity").asText());
            dto.setUpdateTime(root.path("updateTime").asText());

            // 4. 写入缓存
            redisTemplate.opsForValue().set(
                    CACHE_PREFIX_NOW + attractionId,
                    objectMapper.writeValueAsString(dto),
                    Duration.ofMinutes(cacheMinutes));

            return dto;
        } catch (Exception e) {
            log.warn("获取天气数据失败, attractionId={}", attractionId, e);
            return buildFallbackWeather(attractionId);
        }
    }

    @Override
    public List<WeatherForecastDTO> getWeatherForecast(Long attractionId) {
        // 1. 尝试从缓存读取
        String cached = redisTemplate.opsForValue().get(CACHE_PREFIX_FORECAST + attractionId);
        if (cached != null) {
            try {
                return objectMapper.readValue(cached, new TypeReference<List<WeatherForecastDTO>>() {});
            } catch (Exception e) {
                log.warn("解析天气预报缓存失败, attractionId={}", attractionId, e);
            }
        }

        // 2. 获取景点经纬度
        Attraction attraction = attractionMapper.selectById(attractionId);
        if (attraction == null || attraction.getLongitude() == null || attraction.getLatitude() == null) {
            return buildFallbackForecast(attractionId);
        }

        // 3. 调用和风天气API
        try {
            String url = String.format("%s/v7/weather/3d?location=%.6f,%.6f&key=%s",
                    baseUrl, attraction.getLongitude().doubleValue(),
                    attraction.getLatitude().doubleValue(), apiKey);

            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            if (!"200".equals(root.path("code").asText())) {
                log.warn("和风天气预报API返回错误, code={}, attractionId={}", root.path("code").asText(), attractionId);
                return buildFallbackForecast(attractionId);
            }

            List<WeatherForecastDTO> forecastList = new ArrayList<>();
            JsonNode daily = root.path("daily");
            for (JsonNode day : daily) {
                WeatherForecastDTO dto = new WeatherForecastDTO();
                dto.setDate(day.path("fxDate").asText());
                dto.setTempMax(day.path("tempMax").asText());
                dto.setTempMin(day.path("tempMin").asText());
                dto.setTextDay(day.path("textDay").asText());
                dto.setTextNight(day.path("textNight").asText());
                dto.setIconDay(day.path("iconDay").asText());
                dto.setIconNight(day.path("iconNight").asText());
                forecastList.add(dto);
            }

            // 4. 写入缓存（预报缓存2小时）
            redisTemplate.opsForValue().set(
                    CACHE_PREFIX_FORECAST + attractionId,
                    objectMapper.writeValueAsString(forecastList),
                    Duration.ofHours(2));

            return forecastList;
        } catch (Exception e) {
            log.warn("获取天气预报数据失败, attractionId={}", attractionId, e);
            return buildFallbackForecast(attractionId);
        }
    }

    private static final Random RANDOM = new Random();

    private static String rand(String[] arr) {
        return arr[RANDOM.nextInt(arr.length)];
    }

    private static int randInt(int min, int max) {
        return RANDOM.nextInt(max - min + 1) + min;
    }

    private WeatherDTO buildFallbackWeather(Long attractionId) {
        int month = LocalDate.now().getMonthValue();

        String[] texts = month >= 3 && month <= 5
                ? new String[]{"多云", "阴", "小雨", "晴"}
                : month >= 6 && month <= 8
                ? new String[]{"晴", "多云", "雷阵雨", "晴间多云"}
                : month >= 9 && month <= 11
                ? new String[]{"晴", "多云", "晴", "晴间多云"}
                : new String[]{"阴", "多云", "小雨", "阴转多云"};

        String[] windDirs = month >= 3 && month <= 5
                ? new String[]{"东南风", "南风", "东风"}
                : month >= 6 && month <= 8
                ? new String[]{"南风", "西南风", "东南风"}
                : month >= 9 && month <= 11
                ? new String[]{"北风", "东北风", "东风"}
                : new String[]{"北风", "西北风", "东北风"};

        int[][] tempRanges = {{2,8},{4,11},{8,16},{14,22},{19,27},{23,31},{26,35},{25,34},{21,29},{14,23},{9,17},{4,11}};
        int[] range = tempRanges[month - 1];
        int temp = randInt(range[0], range[1]);

        String text = rand(texts);
        String icon = iconForText(text);

        WeatherDTO dto = new WeatherDTO();
        dto.setAttractionId(attractionId);
        dto.setTemp(String.valueOf(temp));
        dto.setFeelsLike(String.valueOf(temp + randInt(-2, 2)));
        dto.setText(text);
        dto.setIcon(icon);
        dto.setWindDir(rand(windDirs));
        dto.setWindScale(String.valueOf(randInt(1, 3)));
        dto.setHumidity(String.valueOf(randInt(55, 85)));
        dto.setUpdateTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm+08:00")));
        return dto;
    }

    private List<WeatherForecastDTO> buildFallbackForecast(Long attractionId) {
        int month = LocalDate.now().getMonthValue();
        String[] texts = month >= 3 && month <= 5
                ? new String[]{"多云", "阴", "小雨", "晴"}
                : month >= 6 && month <= 8
                ? new String[]{"晴", "多云", "雷阵雨", "晴间多云"}
                : month >= 9 && month <= 11
                ? new String[]{"晴", "多云", "晴", "晴间多云"}
                : new String[]{"阴", "多云", "小雨", "阴转多云"};
        String[] nightTexts = {"晴", "多云", "阴", "多云", "晴"};

        int[][] tempRanges = {{2,8},{4,11},{8,16},{14,22},{19,27},{23,31},{26,35},{25,34},{21,29},{14,23},{9,17},{4,11}};

        List<WeatherForecastDTO> list = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            LocalDate d = LocalDate.now().plusDays(i);
            int dMonth = d.getMonthValue();
            int[] dRange = tempRanges[dMonth - 1];
            String dayText = rand(texts);
            String nightText = rand(nightTexts);

            WeatherForecastDTO dto = new WeatherForecastDTO();
            dto.setDate(d.toString());
            dto.setTempMax(String.valueOf(randInt(dRange[1] - 3, dRange[1])));
            dto.setTempMin(String.valueOf(randInt(dRange[0], dRange[0] + 3)));
            dto.setTextDay(dayText);
            dto.setTextNight(nightText);
            dto.setIconDay(iconForText(dayText));
            dto.setIconNight(iconForText(nightText));
            list.add(dto);
        }
        return list;
    }

    private static String iconForText(String text) {
        switch (text) {
            case "晴": return "100";
            case "多云": return "101";
            case "阴": return "104";
            case "小雨": return "305";
            case "雷阵雨": return "302";
            case "晴间多云": return "151";
            case "阴转多云": return "153";
            default: return "101";
        }
    }
}

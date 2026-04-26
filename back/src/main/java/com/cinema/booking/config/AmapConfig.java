package com.cinema.booking.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "amap")
public class AmapConfig {

    private String webKey;
    private String textSearchUrl;
    private String detailUrl;
    private int connectTimeout = 5000;
    private int readTimeout = 10000;
    private SyncConfig sync = new SyncConfig();

    @Data
    public static class SyncConfig {
        private String defaultRegion = "全国";
        private int defaultPageSize = 25;
    }
}

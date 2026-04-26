package com.cinema.booking.service.amap;

import com.cinema.booking.config.AmapConfig;
import com.cinema.booking.entity.Attraction;
import com.cinema.booking.mapper.AttractionMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AmapSyncService {

    private final AmapConfig amapConfig;
    private final AmapCategoryMapping categoryMapping;
    private final AttractionMapper attractionMapper;
    private final ObjectMapper objectMapper;

    public SyncResult syncFromAmap(String region, String keyword, int maxPages) {
        RestTemplate restTemplate = new RestTemplate();
        List<Attraction> allAttractions = new ArrayList<>();
        int pageNum = 1;
        int pageSize = amapConfig.getSync().getDefaultPageSize();
        int totalCount = 0;

        try {
            do {
                String showFields = "business,photos,navi,panorama";
                String url = String.format("%s?key=%s&keywords=%s&region=%s&page_size=%d&page_num=%d&show_fields=%s&output=json",
                        amapConfig.getTextSearchUrl(),
                        amapConfig.getWebKey(),
                        URLEncoder.encode(keyword, StandardCharsets.UTF_8),
                        URLEncoder.encode(region, StandardCharsets.UTF_8),
                        pageSize,
                        pageNum,
                        showFields);

                String jsonStr = restTemplate.getForObject(url, String.class);
                JsonNode root = objectMapper.readTree(jsonStr);

                if (!"1".equals(root.path("status").asText())) {
                    log.warn("高德API请求失败 [page={}], infocode={}, info={}",
                            pageNum, root.path("infocode").asText(), root.path("info").asText());
                    break;
                }

                JsonNode pois = root.path("pois");
                if (pois.isMissingNode() || pois.isEmpty()) {
                    break;
                }

                for (JsonNode poi : pois) {
                    Attraction attraction = mapToAttraction(poi);
                    // 缺少图片或简介时补调详情
                    if (attraction.getCoverImage() == null || attraction.getDescription() == null) {
                        fillDetail(restTemplate, poi.path("id").asText(), attraction);
                    }
                    allAttractions.add(attraction);
                }

                totalCount = root.path("count").asInt(0);
                pageNum++;
            } while ((pageNum - 1) * pageSize < totalCount && pageNum <= maxPages);

        } catch (Exception e) {
            log.error("高德数据同步异常", e);
            throw new RuntimeException("高德数据同步失败: " + e.getMessage(), e);
        }

        return persist(allAttractions);
    }

    private Attraction mapToAttraction(JsonNode poi) {
        Attraction a = new Attraction();

        // 高德 POI ID
        a.setAmapPoiId(poi.path("id").asText(null));

        // 基础字段
        a.setName(poi.path("name").asText(null));
        a.setAddress(poi.path("address").asText(null));

        // 经纬度
        String location = poi.path("location").asText(null);
        if (location != null && location.contains(",")) {
            String[] coords = location.split(",");
            a.setLongitude(new BigDecimal(coords[0]));
            a.setLatitude(new BigDecimal(coords[1]));
        }

        // 分类
        String type = poi.path("type").asText(null);
        a.setCategoryId(categoryMapping.resolveCategoryId(type));

        // 图片
        JsonNode photos = poi.path("photos");
        List<String> imgUrls = new ArrayList<>();
        if (photos.isArray()) {
            for (JsonNode photo : photos) {
                String imgUrl = photo.path("url").asText(null);
                if (imgUrl != null && !imgUrl.isEmpty()) {
                    imgUrls.add(imgUrl);
                }
            }
        }
        if (!imgUrls.isEmpty()) {
            a.setCoverImage(imgUrls.get(0));
            try { a.setImages(objectMapper.writeValueAsString(imgUrls)); } catch (Exception ignored) {}
        }

        // business 深层信息
        JsonNode business = poi.path("business");
        if (!business.isMissingNode()) {
            a.setDescription(business.path("intro").asText(null));

            String ratingStr = business.path("rating").asText(null);
            if (ratingStr != null && !ratingStr.isEmpty()) {
                try { a.setRating(new BigDecimal(ratingStr)); } catch (NumberFormatException ignored) {}
            }

            String costStr = business.path("cost").asText(null);
            if (costStr != null && !costStr.isEmpty()) {
                try { a.setTicketPrice(new BigDecimal(costStr)); } catch (NumberFormatException ignored) {}
            }

            a.setOpeningHours(business.path("opentime").asText(null));
        }

        // 全景图
        String panorama = poi.path("panorama").asText(null);
        if (panorama != null && !panorama.isEmpty()) {
            if (panorama.contains("|")) {
                panorama = panorama.split("\\|")[0];
            }
            a.setPanoramaUrl(panorama);
        }

        // 默认值
        a.setStatus(1);
        a.setViewCount(0);
        a.setSortOrder(0);
        a.setDeleted(false);
        a.setCreatedAt(LocalDateTime.now());
        a.setUpdatedAt(LocalDateTime.now());

        return a;
    }

    private void fillDetail(RestTemplate restTemplate, String poiId, Attraction attraction) {
        if (poiId == null || poiId.isEmpty()) return;

        try {
            String url = amapConfig.getDetailUrl() + "?key=" + amapConfig.getWebKey() + "&id=" + poiId + "&output=json";
            String jsonStr = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(jsonStr);

            if (!"1".equals(root.path("status").asText())) return;

            JsonNode detail = root.path("pois").path(0);
            if (detail.isMissingNode()) return;

            // 补充简介
            if (attraction.getDescription() == null || attraction.getDescription().isEmpty()) {
                attraction.setDescription(detail.path("intro").asText(null));
            }

            // 补充图片
            if (attraction.getImages() == null || attraction.getImages().isEmpty()) {
                JsonNode photos = detail.path("photos");
                if (photos.isArray() && !photos.isEmpty()) {
                    List<String> imgUrls = new ArrayList<>();
                    for (JsonNode photo : photos) {
                        String imgUrl = photo.path("url").asText(null);
                        if (imgUrl != null) imgUrls.add(imgUrl);
                    }
                    if (!imgUrls.isEmpty()) {
                        attraction.setImages(objectMapper.writeValueAsString(imgUrls));
                        if (attraction.getCoverImage() == null) {
                            attraction.setCoverImage(imgUrls.get(0));
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("获取POI详情失败, poiId={}: {}", poiId, e.getMessage());
        }
    }

    private SyncResult persist(List<Attraction> attractions) {
        int inserted = 0, updated = 0, skipped = 0;

        for (Attraction a : attractions) {
            if (a.getAmapPoiId() == null) {
                skipped++;
                continue;
            }
            try {
                // 检查是否已存在
                String existing = attractionMapper.existsByAmapPoiId(a.getAmapPoiId());
                if (existing != null) {
                    attractionMapper.updateByAmapPoiId(a);
                    updated++;
                } else {
                    attractionMapper.insertByAmapPoiId(a);
                    inserted++;
                }
            } catch (Exception e) {
                log.warn("持久化景点失败, amapPoiId={}: {}", a.getAmapPoiId(), e.getMessage());
                skipped++;
            }
        }
        log.info("高德同步完成: 新增={}, 更新={}, 跳过={}", inserted, updated, skipped);
        return new SyncResult(inserted, updated, skipped);
    }

    public record SyncResult(int inserted, int updated, int skipped) {}
}

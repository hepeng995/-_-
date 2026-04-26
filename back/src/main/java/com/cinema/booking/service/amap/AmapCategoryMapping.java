package com.cinema.booking.service.amap;

import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class AmapCategoryMapping {

    private static final Map<String, Long> KEYWORD_TO_CATEGORY = new LinkedHashMap<>();

    static {
        KEYWORD_TO_CATEGORY.put("农家乐", 3L);
        KEYWORD_TO_CATEGORY.put("住宿", 4L);
        KEYWORD_TO_CATEGORY.put("风景名胜", 1L);
        KEYWORD_TO_CATEGORY.put("公园广场", 1L);
        KEYWORD_TO_CATEGORY.put("自然地物", 1L);
        KEYWORD_TO_CATEGORY.put("科教文化", 2L);
        KEYWORD_TO_CATEGORY.put("历史遗迹", 2L);
        KEYWORD_TO_CATEGORY.put("体育休闲", 2L);
        KEYWORD_TO_CATEGORY.put("博物馆", 2L);
        KEYWORD_TO_CATEGORY.put("教堂", 2L);
        KEYWORD_TO_CATEGORY.put("寺庙", 2L);
    }

    public Long resolveCategoryId(String amapType) {
        if (amapType == null) return 1L;
        for (Map.Entry<String, Long> entry : KEYWORD_TO_CATEGORY.entrySet()) {
            if (amapType.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return 1L;
    }
}

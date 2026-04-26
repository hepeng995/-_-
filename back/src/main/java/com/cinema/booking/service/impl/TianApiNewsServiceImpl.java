package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cinema.booking.dto.tianapi.TianApiNewsItem;
import com.cinema.booking.dto.tianapi.TianApiNewsResponse;
import com.cinema.booking.entity.News;
import com.cinema.booking.mapper.NewsMapper;
import com.cinema.booking.service.TianApiNewsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class TianApiNewsServiceImpl implements TianApiNewsService {

    private final NewsMapper newsMapper;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${tianapi.api-key}")
    private String apiKey;

    @Value("${tianapi.base-url}")
    private String baseUrl;

    @Value("${tianapi.nongye-path}")
    private String nongyePath;

    @Value("${tianapi.default-num:20}")
    private Integer defaultNum;

    @Value("${tianapi.cache-minutes:60}")
    private Integer cacheMinutes;

    @Value("${file.upload.path:files}")
    private String uploadPath;

    private static final Set<String> VALID_CATEGORIES = Set.of("news", "policy", "activity");
    private static final String CACHE_PREFIX = "tianapi:news:";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Override
    @Transactional
    public Map<String, Object> syncNews(String category, String keyword, Integer num) {
        return syncNews(category, keyword, num, false);
    }

    @Override
    @Transactional
    public Map<String, Object> syncNews(String category, String keyword, Integer num, boolean force) {
        if (!VALID_CATEGORIES.contains(category)) {
            throw new RuntimeException("无效的新闻分类: " + category + "，仅支持 news/policy/activity");
        }
        if (num == null || num <= 0) num = defaultNum;
        if (num > 50) num = 50;

        // 构建 Redis 缓存 key
        String cacheKey = CACHE_PREFIX + category + ":"
                + (keyword != null ? keyword : "none") + ":" + num;

        // 强制刷新时清除旧缓存
        if (force) {
            redisTemplate.delete(cacheKey);
            log.info("TianAPI 强制清除缓存: {}", cacheKey);
        }

        // 尝试从缓存获取
        TianApiNewsResponse response = null;
        if (!force) {
            String cachedJson = redisTemplate.opsForValue().get(cacheKey);
            if (cachedJson != null) {
                try {
                    response = objectMapper.readValue(cachedJson, TianApiNewsResponse.class);
                    log.info("TianAPI 缓存命中: {}", cacheKey);
                } catch (Exception e) {
                    log.warn("TianAPI 缓存解析失败: {}", e.getMessage());
                }
            }
        }

        // 缓存未命中或强制刷新，调用 TianAPI
        if (response == null) {
            response = callTianApi(keyword, num);
            if (response.isSuccess()) {
                try {
                    redisTemplate.opsForValue().set(cacheKey,
                            objectMapper.writeValueAsString(response),
                            Duration.ofMinutes(cacheMinutes));
                } catch (Exception e) {
                    log.warn("TianAPI 缓存写入失败: {}", e.getMessage());
                }
            }
        }

        if (!response.isSuccess()) {
            throw new RuntimeException("TianAPI 调用失败: code=" + response.getCode() + ", msg=" + response.getMsg());
        }

        List<TianApiNewsItem> newsList = response.getResult().getList();
        if (newsList == null || newsList.isEmpty()) {
            return Map.of("fetched", 0, "saved", 0, "skipped", 0);
        }

        int fetched = newsList.size();
        int saved = 0;
        int updated = 0;
        int skipped = 0;

        for (TianApiNewsItem item : newsList) {
            if (item.getTitle() == null || item.getTitle().isBlank()) {
                skipped++;
                continue;
            }

            if (isDuplicate(item.getTitle())) {
                if (force) {
                    News existing = findExistingByTitle(item.getTitle());
                    if (existing != null) {
                        boolean needUpdate = false;

                        // 抓取正文（复用于封面提取和内容更新）
                        String newContent = fetchArticleContent(item.getUrl(),
                                item.getDescription(), item.getSource());

                        // 补全空的封面图
                        if (existing.getCoverImage() == null || existing.getCoverImage().isBlank()) {
                            String cover = downloadCoverImage(item.getPicUrl());
                            if (cover.isBlank() && newContent != null) {
                                String fromContent = extractCoverFromContent(newContent);
                                cover = (fromContent != null && !fromContent.isBlank()) ? fromContent : "";
                            }
                            if (!cover.isBlank()) {
                                existing.setCoverImage(cover);
                                needUpdate = true;
                            }
                        }

                        // 补全空的摘要
                        if ((existing.getSummary() == null || existing.getSummary().isBlank())
                                && item.getDescription() != null && !item.getDescription().isBlank()) {
                            existing.setSummary(item.getDescription());
                            needUpdate = true;
                        }

                        // 更新正文
                        if (newContent != null && newContent.length() > existing.getContent().length()) {
                            existing.setContent(newContent);
                            needUpdate = true;
                        }

                        if (needUpdate) {
                            existing.setUpdatedAt(LocalDateTime.now());
                            newsMapper.updateById(existing);
                            updated++;
                            log.info("强制更新已有文章: {}", item.getTitle());
                        } else {
                            skipped++;
                        }
                        continue;
                    }
                }
                skipped++;
                continue;
            }

            String coverImage = downloadCoverImage(item.getPicUrl());
            News news = convertToNews(item, category, coverImage);
            newsMapper.insert(news);
            saved++;
        }

        log.info("TianAPI 同步完成: 获取={}, 新增={}, 更新={}, 跳过={}", fetched, saved, updated, skipped);
        return Map.of("fetched", fetched, "saved", saved, "updated", updated, "skipped", skipped);
    }

    private TianApiNewsResponse callTianApi(String keyword, Integer num) {
        StringBuilder urlBuilder = new StringBuilder(baseUrl + nongyePath)
                .append("?key=").append(apiKey)
                .append("&num=").append(num)
                .append("&form=1");

        if (keyword != null && !keyword.isBlank()) {
            urlBuilder.append("&word=").append(URLEncoder.encode(keyword, StandardCharsets.UTF_8));
        }

        String url = urlBuilder.toString();
        log.info("调用 TianAPI: {}", url.replaceAll("key=[^&]+", "key=***"));

        try {
            String json = restTemplate.getForObject(url, String.class);
            return objectMapper.readValue(json, TianApiNewsResponse.class);
        } catch (Exception e) {
            log.error("TianAPI 调用异常", e);
            TianApiNewsResponse failResp = new TianApiNewsResponse();
            failResp.setCode(-1);
            failResp.setMsg("调用异常: " + e.getMessage());
            return failResp;
        }
    }

    private String downloadCoverImage(String picUrl) {
        if (picUrl == null || picUrl.isBlank()) return "";

        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);
            org.springframework.http.ResponseEntity<byte[]> response = restTemplate.exchange(
                    picUrl, org.springframework.http.HttpMethod.GET, entity, byte[].class);
            byte[] imageBytes = response.getBody();
            if (imageBytes == null || imageBytes.length == 0) return picUrl;

            String extension = ".jpg";
            if (picUrl.toLowerCase().contains(".png")) extension = ".png";
            else if (picUrl.toLowerCase().contains(".gif")) extension = ".gif";
            else if (picUrl.toLowerCase().contains(".webp")) extension = ".webp";

            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(uploadPath, fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, imageBytes);

            log.info("封面图下载成功: {} -> {}", picUrl, fileName);
            return "/api/file/download/" + fileName;
        } catch (Exception e) {
            log.warn("封面图下载失败，使用原始URL: {} - {}", picUrl, e.getMessage());
            return picUrl;
        }
    }

    /**
     * 从文章页面抓取第一张图片作为封面图
     */
    private String extractCoverFromArticle(String articleUrl) {
        if (articleUrl == null || articleUrl.isBlank()) return "";

        try {
            Document doc = Jsoup.connect(articleUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(15000)
                    .get();

            String imageUrl = findCoverImage(doc);
            if (imageUrl != null && !imageUrl.isBlank()) {
                String localPath = downloadCoverImage(imageUrl);
                if (!localPath.isBlank()) {
                    log.info("从文章页抓取封面图成功: {} -> {}", articleUrl, localPath);
                    return localPath;
                }
            }

            log.warn("文章页未找到合适的封面图: {}", articleUrl);
        } catch (Exception e) {
            log.warn("从文章页抓取封面图失败: {} - {}", articleUrl, e.getMessage());
        }
        return "";
    }

    /**
     * 从 HTML 文档中查找适合做封面的图片，优先从正文区域选择
     */
    private String findCoverImage(Document doc) {
        String[] contentSelectors = {
                "#ContentPh", ".article-content", ".article-body", ".article_content",
                ".post-content", ".entry-content", "#article_content", "#artibody",
                ".art_content", "#content .text", "article .content", "article"
        };

        for (String selector : contentSelectors) {
            try {
                Element el = doc.selectFirst(selector);
                if (el != null) {
                    String url = pickBestImage(el);
                    if (url != null) return url;
                }
            } catch (Exception ignored) {}
        }

        return pickBestImage(doc.body());
    }

    private String pickBestImage(Element container) {
        if (container == null) return null;
        Elements imgs = container.select("img[src]");
        int found = 0;
        for (Element img : imgs) {
            String src = img.absUrl("src");
            if (src.isEmpty()) src = img.attr("src");
            if (src.isEmpty() || src.contains("data:") || src.contains("icon")
                    || src.contains("logo") || src.contains("avatar") || src.contains("emoji")) continue;
            if (src.startsWith("//")) src = "https:" + src;
            if (src.startsWith("http")) {
                found++;
                if (found == 1) continue; // 跳过第一张（通常是网站图标/缩略图）
                return src;
            }
        }
        return null;
    }

    private boolean isDuplicate(String title) {
        LambdaQueryWrapper<News> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(News::getTitle, title)
               .last("LIMIT 1");
        return newsMapper.selectCount(wrapper) > 0;
    }

    private News findExistingByTitle(String title) {
        LambdaQueryWrapper<News> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(News::getTitle, title)
               .last("LIMIT 1");
        return newsMapper.selectOne(wrapper);
    }

    private News convertToNews(TianApiNewsItem item, String category, String coverImage) {
        LocalDateTime publishTime = parseDateTime(item.getCtime());

        String description = item.getDescription() != null ? item.getDescription() : "";
        String content = fetchArticleContent(item.getUrl(), description, item.getSource());

        // 如果封面图为空，从已抓取的正文中提取第一张图片
        if (coverImage == null || coverImage.isBlank()) {
            String fromContent = extractCoverFromContent(content);
            if (fromContent != null && !fromContent.isBlank()) {
                coverImage = fromContent;
            }
        }

        String sourceName = item.getSource() != null ? item.getSource() : "未知";

        return News.builder()
                .title(item.getTitle())
                .summary(description)
                .content(content)
                .coverImage(coverImage)
                .category(category)
                .author(sourceName)
                .source(sourceName + " - 天聚数行")
                .viewCount(0)
                .isTop(true)
                .isFeatured(true)
                .publishTime(publishTime)
                .status(1)
                .sortOrder(getNextSortOrder())
                .createdAt(publishTime)
                .updatedAt(publishTime)
                .deleted(false)
                .build();
    }

    /**
     * 通过Jsoup抓取文章原始页面，提取正文HTML
     * 降级策略：抓取失败时使用description拼凑基础内容
     */
    private String fetchArticleContent(String articleUrl, String description, String source) {
        if (articleUrl == null || articleUrl.isBlank()) {
            return buildFallbackContent(description, source, null);
        }

        try {
            Document doc = Jsoup.connect(articleUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .referrer(articleUrl)
                    .timeout(20000)
                    .get();

            String extractedHtml = extractMainContent(doc);
            if (extractedHtml != null && !extractedHtml.isBlank()) {
                return extractedHtml;
            }

            log.warn("Jsoup未提取到正文，使用降级内容: {}", articleUrl);
        } catch (Exception e) {
            log.warn("Jsoup抓取正文失败: {} - {}", articleUrl, e.getMessage());
        }

        return buildFallbackContent(description, source, articleUrl);
    }

    /**
     * 从HTML文档中提取正文区域，按优先级尝试多种CSS选择器
     */
    private String extractMainContent(Document doc) {
        String[] contentSelectors = {
                "#ContentPh",                       // 光明网
                ".article-content",                 // 通用
                ".article-body",                    // 通用
                ".article_content",                 // 通用
                ".post-content",                    // WordPress
                ".entry-content",                   // WordPress
                "#article_content",                 // 通用
                "#artibody",                        // 新浪
                ".art_content",                     // 通用
                "#content .text",                   // 通用
                "article .content",                 // HTML5 article
                "article",                          // HTML5 article
        };

        for (String selector : contentSelectors) {
            try {
                Element el = doc.selectFirst(selector);
                if (el != null) {
                    String html = cleanContentHtml(el);
                    if (html.length() > 50) {
                        return html;
                    }
                }
            } catch (Exception ignored) {
            }
        }

        return null;
    }

    /**
     * 清理提取到的HTML：移除脚本/样式/广告，保留段落和图片
     */
    private String cleanContentHtml(Element el) {
        el.select("script, style, iframe, .ad, .advertisement, .share, .m-zbTool, .u-moreText").remove();

        String baseUri = el.ownerDocument() != null ? el.ownerDocument().baseUri() : "";
        Elements imgs = el.select("img");
        for (Element img : imgs) {
            String src = img.absUrl("src");
            if (src.isEmpty()) {
                src = img.attr("src");
            }
            img.attr("src", src);
            img.removeAttr("id");
            img.removeAttr("align");
            img.removeAttr("title");
        }

        Elements ps = el.select("p");
        for (Element p : ps) {
            p.removeAttr("class");
            p.removeAttr("style");
        }

        return el.html().trim();
    }

    /**
     * 降级内容：当无法抓取正文时，使用description拼接基础内容
     */
    private String buildFallbackContent(String description, String source, String url) {
        StringBuilder sb = new StringBuilder();
        if (description != null && !description.isBlank()) {
            sb.append("<p>").append(description).append("</p>");
        }
        sb.append("<p>来源：").append(source != null ? source : "未知").append("</p>");
        if (url != null && !url.isBlank()) {
            sb.append("<p>阅读原文：<a href=\"").append(url)
                    .append("\" target=\"_blank\">").append(url).append("</a></p>");
        }
        return sb.toString();
    }

    @Override
    public Map<String, Object> backfillContent() {
        LambdaQueryWrapper<News> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(News::getDeleted, false)
                .eq(News::getStatus, 1)
                .and(w -> w.like(News::getContent, "阅读原文")
                        .or().lt(News::getContent, 200));
        List<News> candidates = newsMapper.selectList(wrapper);

        if (candidates.isEmpty()) {
            log.info("没有需要回填的文章");
            return Map.of("total", 0, "success", 0, "failed", 0, "skipped", 0);
        }

        log.info("发现 {} 篇需要回填正文的文章", candidates.size());
        int total = candidates.size();
        int success = 0;
        int failed = 0;
        int skipped = 0;

        for (News news : candidates) {
            // 先从已有 content 中提取 URL，再尝试从 source 字段提取
            String articleUrl = extractUrlFromContent(news.getContent());
            if (articleUrl == null || articleUrl.isBlank()) {
                // 尝试从 content 的其他链接中提取
                articleUrl = extractFirstHttpUrl(news.getContent());
            }

            if (articleUrl == null || articleUrl.isBlank()) {
                skipped++;
                log.warn("回填跳过（无文章URL）: {}", news.getTitle());
                continue;
            }

            try {
                String newContent = fetchArticleContent(articleUrl, news.getSummary(), news.getAuthor());
                if (newContent != null && newContent.length() > news.getContent().length()) {
                    news.setContent(newContent);

                    // 顺便补全封面图
                    if (news.getCoverImage() == null || news.getCoverImage().isBlank()) {
                        String cover = extractCoverFromContent(newContent);
                        if (cover != null && !cover.isBlank()) {
                            news.setCoverImage(cover);
                        }
                    }

                    news.setUpdatedAt(LocalDateTime.now());
                    newsMapper.updateById(news);
                    success++;
                    log.info("回填成功: {} ({} -> {} 字符)", news.getTitle(),
                            news.getContent().length(), newContent.length());
                } else {
                    skipped++;
                    log.warn("回填跳过（新内容不够充实）: {} - 旧={}字符, 新={}字符",
                            news.getTitle(), news.getContent().length(),
                            newContent != null ? newContent.length() : 0);
                }

                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                failed++;
                log.error("回填失败: {} - {}", news.getTitle(), e.getMessage());
            }
        }

        log.info("回填完成: 总数={}, 成功={}, 失败={}, 跳过={}", total, success, failed, skipped);
        return Map.of("total", total, "success", success, "failed", failed, "skipped", skipped);
    }

    /**
     * 从已存储的文章正文中提取第一张图片作为封面
     */
    private String extractCoverFromContent(String content) {
        if (content == null || content.isBlank()) return null;
        try {
            Document doc = Jsoup.parse(content);
            return pickBestImage(doc.body());
        } catch (Exception e) {
            return null;
        }
    }

    private String extractUrlFromContent(String content) {
        if (content == null || content.isBlank()) return null;
        try {
            Document doc = Jsoup.parse(content);
            Elements links = doc.select("a[href]");
            for (Element link : links) {
                String href = link.attr("href");
                if (href.startsWith("http") && !href.contains("tianapi.com")) {
                    return href;
                }
            }
        } catch (Exception e) {
            log.warn("解析content中的URL失败: {}", e.getMessage());
        }
        return null;
    }

    private String extractFirstHttpUrl(String text) {
        if (text == null || text.isBlank()) return null;
        String regex = "https?://[^\\s<>\"]+";
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(regex);
        java.util.regex.Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    private Integer getNextSortOrder() {
        LambdaQueryWrapper<News> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(News::getSortOrder).last("LIMIT 1");
        News last = newsMapper.selectOne(wrapper);
        return (last != null && last.getSortOrder() != null)
                ? last.getSortOrder() + 1 : 1;
    }

    @Override
    public Map<String, Object> backfillCoverImages() {
        // 找出所有缺少封面图的已发布资讯
        LambdaQueryWrapper<News> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(News::getDeleted, false)
                .eq(News::getStatus, 1)
                .and(w -> w.isNull(News::getCoverImage).or().eq(News::getCoverImage, ""));
        List<News> candidates = newsMapper.selectList(wrapper);

        if (candidates.isEmpty()) {
            log.info("没有缺少封面图的资讯");
            return Map.of("total", 0, "success", 0, "failed", 0, "skipped", 0);
        }

        log.info("发现 {} 条缺少封面图的资讯，开始从TianAPI重新匹配", candidates.size());
        int total = candidates.size();
        int success = 0;
        int failed = 0;
        int skipped = 0;

        for (News news : candidates) {
            try {
                // 从TianAPI搜索匹配的新闻（按标题关键词搜索）
                String keyword = news.getTitle().length() > 20
                        ? news.getTitle().substring(0, 20) : news.getTitle();
                TianApiNewsResponse response = callTianApi(keyword, 10);

                if (!response.isSuccess() || response.getResult() == null
                        || response.getResult().getList() == null) {
                    skipped++;
                    continue;
                }

                // 在返回结果中找到标题匹配的文章
                TianApiNewsItem matched = null;
                for (TianApiNewsItem item : response.getResult().getList()) {
                    if (item.getTitle() != null && item.getTitle().equals(news.getTitle())) {
                        matched = item;
                        break;
                    }
                }

                if (matched != null && matched.getPicUrl() != null && !matched.getPicUrl().isBlank()) {
                    String coverImage = downloadCoverImage(matched.getPicUrl());
                    if (coverImage != null && !coverImage.isBlank()) {
                        news.setCoverImage(coverImage);
                        news.setUpdatedAt(LocalDateTime.now());
                        newsMapper.updateById(news);
                        success++;
                        log.info("封面图回填成功(TianAPI): {}", news.getTitle());
                        continue;
                    }
                }

                // TianAPI 无图，尝试从文章正文提取已有图片
                String coverFromContent = extractCoverFromContent(news.getContent());
                if (coverFromContent != null && !coverFromContent.isBlank()) {
                    news.setCoverImage(coverFromContent);
                    news.setUpdatedAt(LocalDateTime.now());
                    newsMapper.updateById(news);
                    success++;
                    log.info("封面图回填成功(正文提取): {}", news.getTitle());
                    continue;
                }

                // 正文无图，抓取文章原文页面
                String articleUrl = extractUrlFromContent(news.getContent());
                if (articleUrl != null && !articleUrl.isBlank()) {
                    String coverFromPage = extractCoverFromArticle(articleUrl);
                    if (!coverFromPage.isBlank()) {
                        news.setCoverImage(coverFromPage);
                        news.setUpdatedAt(LocalDateTime.now());
                        newsMapper.updateById(news);
                        success++;
                        log.info("封面图回填成功(页面抓取): {}", news.getTitle());
                        continue;
                    }
                }

                skipped++;
            } catch (Exception e) {
                failed++;
                log.error("封面图回填失败: {} - {}", news.getTitle(), e.getMessage());
            }

            try { Thread.sleep(500); } catch (InterruptedException e) {
                Thread.currentThread().interrupt(); break;
            }
        }

        log.info("封面图回填完成: 总数={}, 成功={}, 失败={}, 跳过={}", total, success, failed, skipped);
        return Map.of("total", total, "success", success, "failed", failed, "skipped", skipped);
    }

    private LocalDateTime parseDateTime(String ctime) {
        if (ctime == null || ctime.isBlank()) return LocalDateTime.now();
        try {
            return LocalDateTime.parse(ctime, DATE_FORMATTER);
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }
}

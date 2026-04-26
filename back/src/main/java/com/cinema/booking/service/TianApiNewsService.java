package com.cinema.booking.service;

import java.util.Map;

public interface TianApiNewsService {
    /**
     * 从 TianAPI 同步农业新闻到本地 news 表
     *
     * @param category 新闻分类 (news/policy/activity)
     * @param keyword  搜索关键词（可为 null）
     * @param num      获取数量（默认 20）
     * @return 同步结果 {"fetched": n, "saved": n, "skipped": n}
     */
    Map<String, Object> syncNews(String category, String keyword, Integer num);

    /**
     * 从 TianAPI 同步农业新闻（可强制刷新缓存）
     */
    Map<String, Object> syncNews(String category, String keyword, Integer num, boolean force);

    /**
     * 回填已有文章的正文内容
     * 从 content 中提取"阅读原文"链接，用 Jsoup 抓取完整正文并更新数据库
     *
     * @return 回填结果 {"total": n, "success": n, "failed": n, "skipped": n}
     */
    Map<String, Object> backfillContent();

    /**
     * 重新从TianAPI拉取数据，补全本地缺失的封面图
     *
     * @return 回填结果 {"total": n, "success": n, "failed": n, "skipped": n}
     */
    Map<String, Object> backfillCoverImages();
}

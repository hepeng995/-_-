package com.cinema.booking.utils;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

/**
 * 用户提交富文本（论坛、评价、新闻正文等）入库前的二次过滤。
 *
 * 与前端 DOMPurify 形成纵深防御：即便前端被绕过，后端也会拒绝脚本与可执行属性。
 */
public final class HtmlSanitizer {

    private static final Safelist RICH_TEXT = Safelist.relaxed()
            .addAttributes(":all", "class", "style")
            .addProtocols("a", "href", "http", "https", "mailto")
            .addProtocols("img", "src", "http", "https", "data");

    private HtmlSanitizer() {}

    /** 富文本字段：保留排版/图片/链接，去掉脚本与 on* 事件属性。 */
    public static String cleanRich(String html) {
        if (html == null || html.isBlank()) return html;
        return Jsoup.clean(html, RICH_TEXT);
    }

    /** 纯文本字段（标题、昵称等）：剥掉所有 HTML 标签。 */
    public static String cleanText(String text) {
        if (text == null || text.isBlank()) return text;
        return Jsoup.clean(text, Safelist.none());
    }
}

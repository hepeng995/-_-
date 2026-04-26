package com.cinema.booking.dto.tianapi;

import lombok.Data;

@Data
public class TianApiNewsItem {
    private String id;
    private String ctime;
    private String title;
    private String description;
    private String source;
    private String picUrl;
    private String url;
}

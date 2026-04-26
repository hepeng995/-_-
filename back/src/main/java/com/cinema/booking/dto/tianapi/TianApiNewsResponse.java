package com.cinema.booking.dto.tianapi;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;
import java.util.List;

@Data
public class TianApiNewsResponse {
    private Integer code;
    private String msg;
    private TianApiResult result;

    @Data
    public static class TianApiResult {
        private Integer curpage;
        private Integer allnum;
        @JsonAlias("newslist")
        private List<TianApiNewsItem> list;
    }

    public boolean isSuccess() {
        return code != null && code == 200;
    }
}

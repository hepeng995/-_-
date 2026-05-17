package com.cinema.booking.dto;

import lombok.Getter;

/**
 * 评价查询DTO
 *
 * 注意：sortBy / sortOrder 通过 setter 做白名单约束，防止
 * 外部传入异常字符串导致 MyBatis ${} 拼接的 SQL 注入。
 */
@Getter
public class ReviewQueryDTO {

    private Long productId;
    private Long userId;
    private Integer rating;
    private Integer status;
    private Boolean hasImages;

    /**
     * 排序字段：time / helpful / rating
     */
    private String sortBy = "time";

    /**
     * 排序方向：asc / desc
     */
    private String sortOrder = "desc";

    private Long current = 1L;
    private Long size = 10L;

    public void setProductId(Long productId) { this.productId = productId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setStatus(Integer status) { this.status = status; }
    public void setHasImages(Boolean hasImages) { this.hasImages = hasImages; }
    public void setCurrent(Long current) { this.current = current; }
    public void setSize(Long size) { this.size = size; }

    public void setSortBy(String sortBy) {
        if (sortBy == null) { this.sortBy = "time"; return; }
        switch (sortBy) {
            case "time":
            case "helpful":
            case "rating":
                this.sortBy = sortBy;
                break;
            default:
                this.sortBy = "time";
        }
    }

    public void setSortOrder(String sortOrder) {
        if (sortOrder == null) { this.sortOrder = "desc"; return; }
        if ("asc".equalsIgnoreCase(sortOrder)) {
            this.sortOrder = "asc";
        } else {
            this.sortOrder = "desc";
        }
    }
}

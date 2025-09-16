package com.cinema.booking.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 通用分页请求
 */
@Data
@NoArgsConstructor
public class PageRequest {
    /**
     * 当前页码
     */
    private Integer current = 1;
    
    /**
     * 每页大小
     */
    private Integer size = 10;
    
    /**
     * 构造函数
     */
    public PageRequest(Integer pageNum, Integer pageSize) {
        this.current = pageNum;
        this.size = pageSize;
    }
    
    /**
     * 获取页码
     */
    public Integer getPageNum() {
        return current;
    }
    
    /**
     * 获取页面大小
     */
    public Integer getPageSize() {
        return size;
    }
} 
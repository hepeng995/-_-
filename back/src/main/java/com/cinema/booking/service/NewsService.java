package com.cinema.booking.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.NewsDTO;
import com.cinema.booking.dto.PageRequest;

import java.util.List;

/**
 * 资讯服务接口
 */
public interface NewsService {
    
    /**
     * 分页查询资讯列表
     * @param pageRequest 分页请求参数
     * @param category 分类
     * @param keyword 关键词
     * @param status 状态
     * @param isTop 是否置顶
     * @param isFeatured 是否推荐
     * @return 资讯分页列表
     */
    IPage<NewsDTO> getNewsPage(PageRequest pageRequest, String category, String keyword, Integer status, Boolean isTop, Boolean isFeatured);
    
    /**
     * 根据ID获取资讯详情
     * @param id 资讯ID
     * @return 资讯详情
     */
    NewsDTO getNewsById(Long id);
    
    /**
     * 创建资讯
     * @param newsDTO 资讯信息
     * @return 创建的资讯信息
     */
    NewsDTO createNews(NewsDTO newsDTO);
    
    /**
     * 更新资讯
     * @param id 资讯ID
     * @param newsDTO 资讯信息
     * @return 更新后的资讯信息
     */
    NewsDTO updateNews(Long id, NewsDTO newsDTO);
    
    /**
     * 删除资讯
     * @param id 资讯ID
     */
    void deleteNews(Long id);
    
    /**
     * 获取置顶资讯列表
     * @param limit 限制数量
     * @return 置顶资讯列表
     */
    List<NewsDTO> getTopNews(Integer limit);
    
    /**
     * 获取推荐资讯列表
     * @param limit 限制数量
     * @return 推荐资讯列表
     */
    List<NewsDTO> getFeaturedNews(Integer limit);
    
    /**
     * 获取热门资讯列表
     * @param limit 限制数量
     * @return 热门资讯列表
     */
    List<NewsDTO> getHotNews(Integer limit);
    
    /**
     * 根据分类获取资讯列表
     * @param category 分类
     * @param limit 限制数量
     * @return 资讯列表
     */
    List<NewsDTO> getNewsByCategory(String category, Integer limit);
    
    /**
     * 增加资讯浏览次数
     * @param id 资讯ID
     */
    void incrementViewCount(Long id);
    
    /**
     * 发布资讯
     * @param id 资讯ID
     * @return 更新后的资讯信息
     */
    NewsDTO publishNews(Long id);
    
    /**
     * 下线资讯
     * @param id 资讯ID
     * @return 更新后的资讯信息
     */
    NewsDTO unpublishNews(Long id);
    
    /**
     * 获取资讯总数
     * @return 资讯总数
     */
    Long getTotalCount();
    
    /**
     * 获取今日资讯数量
     * @return 今日资讯数量
     */
    Long getTodayCount();
    
    /**
     * 获取总浏览量
     * @return 总浏览量
     */
    Long getTotalViews();
}

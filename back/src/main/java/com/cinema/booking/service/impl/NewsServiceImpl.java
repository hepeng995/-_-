package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.NewsDTO;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.entity.News;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.NewsMapper;
import com.cinema.booking.service.NewsService;
import com.cinema.booking.utils.BeanCopyUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 资讯服务实现类
 */
@Service
@RequiredArgsConstructor
public class NewsServiceImpl implements NewsService {
    
    private final NewsMapper newsMapper;
    
    private static final Map<String, String> CATEGORY_MAP = new HashMap<>();
    private static final Map<Integer, String> STATUS_MAP = new HashMap<>();
    
    static {
        CATEGORY_MAP.put("news", "乡村新闻");
        CATEGORY_MAP.put("policy", "政策通知");
        CATEGORY_MAP.put("activity", "活动预告");
        
        STATUS_MAP.put(0, "草稿");
        STATUS_MAP.put(1, "已发布");
        STATUS_MAP.put(2, "已下线");
    }
    
    @Override
    public IPage<NewsDTO> getNewsPage(PageRequest pageRequest, String category, String keyword, Integer status, Boolean isTop, Boolean isFeatured) {
        Page<News> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        IPage<News> newsPage = newsMapper.selectNewsPage(page, category, keyword, status, isTop, isFeatured);
        
        return newsPage.convert(this::convertToDTO);
    }
    
    @Override
    public NewsDTO getNewsById(Long id) {
        News news = newsMapper.selectById(id);
        if (news == null || news.getDeleted()) {
            throw new ServiceException("资讯不存在");
        }
        
        return convertToDTO(news);
    }
    
    @Override
    @Transactional
    public NewsDTO createNews(NewsDTO newsDTO) {
        News news = BeanCopyUtils.copyBean(newsDTO, News.class);
        news.setCreatedAt(LocalDateTime.now());
        news.setUpdatedAt(LocalDateTime.now());
        news.setDeleted(false);
        news.setViewCount(0);
        news.setIsTop(newsDTO.getIsTop() != null ? newsDTO.getIsTop() : false);
        news.setIsFeatured(newsDTO.getIsFeatured() != null ? newsDTO.getIsFeatured() : false);
        news.setStatus(newsDTO.getStatus() != null ? newsDTO.getStatus() : 0); // 默认草稿状态
        
        // 如果没有设置发布时间，则设置为当前时间
        if (news.getPublishTime() == null) {
            news.setPublishTime(LocalDateTime.now());
        }
        
        newsMapper.insert(news);
        return convertToDTO(news);
    }
    
    @Override
    @Transactional
    public NewsDTO updateNews(Long id, NewsDTO newsDTO) {
        News existingNews = newsMapper.selectById(id);
        if (existingNews == null || existingNews.getDeleted()) {
            throw new ServiceException("资讯不存在");
        }
        
        News news = BeanCopyUtils.copyBean(newsDTO, News.class);
        news.setId(id);
        news.setUpdatedAt(LocalDateTime.now());
        
        newsMapper.updateById(news);
        return getNewsById(id);
    }
    
    @Override
    @Transactional
    public void deleteNews(Long id) {
        News news = newsMapper.selectById(id);
        if (news == null || news.getDeleted()) {
            throw new ServiceException("资讯不存在");
        }
        
        // 物理删除资讯
        newsMapper.deleteById(id);
    }
    
    @Override
    public List<NewsDTO> getTopNews(Integer limit) {
        List<News> newsList = newsMapper.selectTopNews(limit);
        return newsList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<NewsDTO> getFeaturedNews(Integer limit) {
        List<News> newsList = newsMapper.selectFeaturedNews(limit);
        return newsList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<NewsDTO> getHotNews(Integer limit) {
        List<News> newsList = newsMapper.selectHotNews(limit);
        return newsList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<NewsDTO> getNewsByCategory(String category, Integer limit) {
        List<News> newsList = newsMapper.selectByCategory(category, limit);
        return newsList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public void incrementViewCount(Long id) {
        newsMapper.incrementViewCount(id);
    }
    
    @Override
    @Transactional
    public NewsDTO publishNews(Long id) {
        News news = newsMapper.selectById(id);
        if (news == null || news.getDeleted()) {
            throw new ServiceException("资讯不存在");
        }
        
        news.setStatus(1); // 已发布
        news.setPublishTime(LocalDateTime.now());
        news.setUpdatedAt(LocalDateTime.now());
        
        newsMapper.updateById(news);
        return convertToDTO(news);
    }
    
    @Override
    @Transactional
    public NewsDTO unpublishNews(Long id) {
        News news = newsMapper.selectById(id);
        if (news == null || news.getDeleted()) {
            throw new ServiceException("资讯不存在");
        }
        
        news.setStatus(2); // 已下线
        news.setUpdatedAt(LocalDateTime.now());
        
        newsMapper.updateById(news);
        return convertToDTO(news);
    }
    
    @Override
    public Long getTotalCount() {
        return newsMapper.selectTotalCount();
    }
    
    @Override
    public Long getTodayCount() {
        return newsMapper.selectTodayCount();
    }
    
    @Override
    public Long getTotalViews() {
        return newsMapper.selectTotalViews();
    }
    
    private NewsDTO convertToDTO(News news) {
        NewsDTO dto = BeanCopyUtils.copyBean(news, NewsDTO.class);
        
        // 设置分类描述
        dto.setCategoryDesc(CATEGORY_MAP.get(news.getCategory()));
        
        // 设置状态描述
        dto.setStatusDesc(STATUS_MAP.get(news.getStatus()));
        
        return dto;
    }
}

package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.entity.News;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 资讯Mapper接口
 */
@Mapper
public interface NewsMapper extends BaseMapper<News> {
    
    /**
     * 分页查询资讯列表
     * @param page 分页参数
     * @param category 分类
     * @param keyword 关键词
     * @param status 状态
     * @param isTop 是否置顶
     * @param isFeatured 是否推荐
     * @return 资讯分页列表
     */
    IPage<News> selectNewsPage(Page<News> page, 
                             @Param("category") String category,
                             @Param("keyword") String keyword,
                             @Param("status") Integer status,
                             @Param("isTop") Boolean isTop,
                             @Param("isFeatured") Boolean isFeatured);
    
    /**
     * 获取置顶资讯列表
     * @param limit 限制数量
     * @return 置顶资讯列表
     */
    List<News> selectTopNews(@Param("limit") Integer limit);
    
    /**
     * 获取推荐资讯列表
     * @param limit 限制数量
     * @return 推荐资讯列表
     */
    List<News> selectFeaturedNews(@Param("limit") Integer limit);

    /**
     * 获取最新资讯列表
     * @param limit 限制数量
     * @return 最新资讯列表
     */
    List<News> selectLatestNews(@Param("limit") Integer limit);
    
    /**
     * 根据分类查询资讯列表
     * @param category 分类
     * @param limit 限制数量
     * @return 资讯列表
     */
    List<News> selectByCategory(@Param("category") String category, @Param("limit") Integer limit);
    
    /**
     * 增加浏览次数
     * @param id 资讯ID
     */
    void incrementViewCount(@Param("id") Long id);
    
    /**
     * 获取热门资讯列表
     * @param limit 限制数量
     * @return 热门资讯列表
     */
    List<News> selectHotNews(@Param("limit") Integer limit);
    
    /**
     * 获取资讯总数
     * @return 资讯总数
     */
    Long selectTotalCount();
    
    /**
     * 获取今日资讯数量
     * @return 今日资讯数量
     */
    Long selectTodayCount();
    
    /**
     * 获取总浏览量
     * @return 总浏览量
     */
    Long selectTotalViews();
}

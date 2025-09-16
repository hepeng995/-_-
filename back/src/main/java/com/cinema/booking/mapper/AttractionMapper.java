package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.entity.Attraction;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 景点Mapper接口
 */
@Mapper
public interface AttractionMapper extends BaseMapper<Attraction> {
    
    /**
     * 分页查询景点列表
     * @param page 分页参数
     * @param categoryId 分类ID
     * @param keyword 关键词
     * @param status 状态
     * @return 景点分页列表
     */
    IPage<Attraction> selectAttractionPage(Page<Attraction> page, 
                                         @Param("categoryId") Long categoryId,
                                         @Param("keyword") String keyword,
                                         @Param("status") Integer status);
    
    /**
     * 获取推荐景点列表
     * @param limit 限制数量
     * @return 推荐景点列表
     */
    List<Attraction> selectRecommendAttractions(@Param("limit") Integer limit);
    
    /**
     * 增加浏览次数
     * @param id 景点ID
     */
    void incrementViewCount(@Param("id") Long id);
    
    /**
     * 根据分类ID查询景点列表
     * @param categoryId 分类ID
     * @return 景点列表
     */
    List<Attraction> selectByCategoryId(@Param("categoryId") Long categoryId);
    
    /**
     * 获取热门景点列表
     * @param limit 限制数量
     * @return 热门景点列表
     */
    List<Attraction> selectHotAttractions(@Param("limit") Integer limit);
}

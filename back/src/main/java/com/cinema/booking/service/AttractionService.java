package com.cinema.booking.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.AttractionDTO;
import com.cinema.booking.dto.CategoryDTO;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.entity.Attraction;

import java.util.List;

/**
 * 景点服务接口
 */
public interface AttractionService {
    
    /**
     * 分页查询景点列表
     * @param pageRequest 分页请求参数
     * @param categoryId 分类ID
     * @param keyword 关键词
     * @param status 状态
     * @return 景点分页列表
     */
    IPage<AttractionDTO> getAttractionPage(PageRequest pageRequest, Long categoryId, String keyword, Integer status);
    
    /**
     * 根据ID获取景点详情
     * @param id 景点ID
     * @return 景点详情
     */
    AttractionDTO getAttractionById(Long id);
    
    /**
     * 创建景点
     * @param attractionDTO 景点信息
     * @return 创建的景点信息
     */
    AttractionDTO createAttraction(AttractionDTO attractionDTO);
    
    /**
     * 更新景点
     * @param id 景点ID
     * @param attractionDTO 景点信息
     * @return 更新后的景点信息
     */
    AttractionDTO updateAttraction(Long id, AttractionDTO attractionDTO);
    
    /**
     * 删除景点
     * @param id 景点ID
     */
    void deleteAttraction(Long id);
    
    /**
     * 获取推荐景点列表
     * @param limit 限制数量
     * @return 推荐景点列表
     */
    List<AttractionDTO> getRecommendAttractions(Integer limit);
    
    /**
     * 获取热门景点列表
     * @param limit 限制数量
     * @return 热门景点列表
     */
    List<AttractionDTO> getHotAttractions(Integer limit);
    
    /**
     * 根据分类ID获取景点列表
     * @param categoryId 分类ID
     * @return 景点列表
     */
    List<AttractionDTO> getAttractionsByCategory(Long categoryId);
    
    /**
     * 增加景点浏览次数
     * @param id 景点ID
     */
    void incrementViewCount(Long id);
    
    /**
     * 获取景点分类列表
     * @return 分类列表
     */
    List<CategoryDTO> getAttractionCategories();
    
    /**
     * 创建景点分类
     * @param categoryDTO 分类信息
     * @return 创建的分类信息
     */
    CategoryDTO createAttractionCategory(CategoryDTO categoryDTO);
    
    /**
     * 更新景点分类
     * @param id 分类ID
     * @param categoryDTO 分类信息
     * @return 更新后的分类信息
     */
    CategoryDTO updateAttractionCategory(Long id, CategoryDTO categoryDTO);
    
    /**
     * 删除景点分类
     * @param id 分类ID
     */
    void deleteAttractionCategory(Long id);
}

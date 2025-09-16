package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cinema.booking.entity.AttractionCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 景点分类Mapper接口
 */
@Mapper
public interface AttractionCategoryMapper extends BaseMapper<AttractionCategory> {
    
    /**
     * 获取启用的分类列表，按排序值排序
     * @return 分类列表
     */
    List<AttractionCategory> selectEnabledCategories();
    
    /**
     * 根据状态查询分类列表
     * @param status 状态
     * @return 分类列表
     */
    List<AttractionCategory> selectByStatus(@Param("status") Integer status);
}

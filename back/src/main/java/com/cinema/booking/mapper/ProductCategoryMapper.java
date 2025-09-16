package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cinema.booking.entity.ProductCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 商品分类Mapper接口
 */
@Mapper
public interface ProductCategoryMapper extends BaseMapper<ProductCategory> {
    
    /**
     * 获取启用的分类列表，按排序值排序
     * @return 分类列表
     */
    List<ProductCategory> selectEnabledCategories();
    
    /**
     * 根据状态查询分类列表
     * @param status 状态
     * @return 分类列表
     */
    List<ProductCategory> selectByStatus(@Param("status") Integer status);
}

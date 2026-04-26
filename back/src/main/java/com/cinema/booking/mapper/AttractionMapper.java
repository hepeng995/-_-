package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.entity.Attraction;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

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

    // ==================== 高德数据同步 ====================

    @Select("SELECT amap_poi_id FROM attractions WHERE amap_poi_id = #{amapPoiId} AND deleted = 0")
    String existsByAmapPoiId(@Param("amapPoiId") String amapPoiId);

    @Insert("INSERT INTO attractions (amap_poi_id, name, category_id, description, cover_image, images, " +
            "panorama_url, longitude, latitude, address, traffic_guide, opening_hours, " +
            "ticket_price, rating, view_count, status, sort_order, deleted, created_at, updated_at) " +
            "VALUES (#{amapPoiId}, #{name}, #{categoryId}, #{description}, #{coverImage}, #{images}, " +
            "#{panoramaUrl}, #{longitude}, #{latitude}, #{address}, #{trafficGuide}, #{openingHours}, " +
            "#{ticketPrice}, #{rating}, #{viewCount}, #{status}, #{sortOrder}, #{deleted}, NOW(), NOW())")
    int insertByAmapPoiId(Attraction attraction);

    @Update("UPDATE attractions SET name=#{name}, category_id=#{categoryId}, description=#{description}, " +
            "cover_image=#{coverImage}, images=#{images}, panorama_url=#{panoramaUrl}, " +
            "longitude=#{longitude}, latitude=#{latitude}, address=#{address}, " +
            "opening_hours=#{openingHours}, ticket_price=#{ticketPrice}, rating=#{rating}, " +
            "updated_at=NOW() WHERE amap_poi_id=#{amapPoiId} AND deleted = 0")
    int updateByAmapPoiId(Attraction attraction);
}

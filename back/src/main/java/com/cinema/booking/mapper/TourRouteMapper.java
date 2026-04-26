package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.entity.TourRoute;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TourRouteMapper extends BaseMapper<TourRoute> {

    IPage<TourRoute> selectRoutePage(
            Page<TourRoute> page,
            @Param("keyword") String keyword,
            @Param("difficulty") String difficulty,
            @Param("days") Integer days,
            @Param("tag") String tag,
            @Param("status") Integer status
    );

    List<TourRoute> selectRecommendRoutes(@Param("limit") Integer limit);

    void incrementViewCount(@Param("id") Long id);
}

package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cinema.booking.dto.RouteItemDTO;
import com.cinema.booking.entity.RouteItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RouteItemMapper extends BaseMapper<RouteItem> {

    List<RouteItemDTO> selectItemsByRouteId(@Param("routeId") Long routeId);

    List<RouteItemDTO> selectItemsByRouteIds(@Param("routeIds") List<Long> routeIds);
}

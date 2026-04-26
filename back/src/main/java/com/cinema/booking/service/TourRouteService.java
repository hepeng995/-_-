package com.cinema.booking.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.dto.TourRouteDTO;

import java.util.List;

public interface TourRouteService {

    IPage<TourRouteDTO> getRoutePage(PageRequest pageRequest, String keyword,
                                      String difficulty, Integer days, String tag, Integer status);

    TourRouteDTO getRouteById(Long id);

    TourRouteDTO createRoute(TourRouteDTO routeDTO);

    TourRouteDTO updateRoute(Long id, TourRouteDTO routeDTO);

    void deleteRoute(Long id);

    List<TourRouteDTO> getRecommendRoutes(Integer limit);

    void incrementViewCount(Long id);
}

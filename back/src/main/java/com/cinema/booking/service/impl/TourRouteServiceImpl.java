package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.dto.RouteItemDTO;
import com.cinema.booking.dto.TourRouteDTO;
import com.cinema.booking.entity.RouteItem;
import com.cinema.booking.entity.TourRoute;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.RouteItemMapper;
import com.cinema.booking.mapper.TourRouteMapper;
import com.cinema.booking.service.TourRouteService;
import com.cinema.booking.utils.BeanCopyUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourRouteServiceImpl implements TourRouteService {

    private final TourRouteMapper tourRouteMapper;
    private final RouteItemMapper routeItemMapper;

    @Override
    public IPage<TourRouteDTO> getRoutePage(PageRequest pageRequest, String keyword,
                                             String difficulty, Integer days,
                                             String tag, Integer status) {
        Page<TourRoute> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        IPage<TourRoute> routePage = tourRouteMapper.selectRoutePage(
                page, keyword, difficulty, days, tag, status);
        return routePage.convert(this::toDTO);
    }

    @Override
    public TourRouteDTO getRouteById(Long id) {
        TourRoute route = tourRouteMapper.selectById(id);
        if (route == null || route.getDeleted()) {
            throw new ServiceException("路线不存在");
        }
        TourRouteDTO dto = toDTO(route);
        dto.setItems(routeItemMapper.selectItemsByRouteId(id));
        return dto;
    }

    @Override
    @Transactional
    public TourRouteDTO createRoute(TourRouteDTO routeDTO) {
        TourRoute route = toEntity(routeDTO);
        route.setCreatedAt(LocalDateTime.now());
        route.setUpdatedAt(LocalDateTime.now());
        route.setDeleted(false);
        if (route.getViewCount() == null) route.setViewCount(0);
        if (route.getRating() == null) route.setRating(BigDecimal.ZERO);
        if (route.getRatingCount() == null) route.setRatingCount(0);

        tourRouteMapper.insert(route);
        saveItems(route.getId(), routeDTO.getItems());
        return getRouteById(route.getId());
    }

    @Override
    @Transactional
    public TourRouteDTO updateRoute(Long id, TourRouteDTO routeDTO) {
        TourRoute existing = tourRouteMapper.selectById(id);
        if (existing == null || existing.getDeleted()) {
            throw new ServiceException("路线不存在");
        }

        TourRoute route = toEntity(routeDTO);
        route.setId(id);
        route.setUpdatedAt(LocalDateTime.now());
        tourRouteMapper.updateById(route);

        routeItemMapper.delete(
                new LambdaQueryWrapper<RouteItem>().eq(RouteItem::getRouteId, id));
        saveItems(id, routeDTO.getItems());
        return getRouteById(id);
    }

    @Override
    @Transactional
    public void deleteRoute(Long id) {
        TourRoute route = tourRouteMapper.selectById(id);
        if (route == null || route.getDeleted()) {
            throw new ServiceException("路线不存在");
        }
        route.setDeleted(true);
        route.setUpdatedAt(LocalDateTime.now());
        tourRouteMapper.updateById(route);
    }

    @Override
    public List<TourRouteDTO> getRecommendRoutes(Integer limit) {
        List<TourRoute> routes = tourRouteMapper.selectRecommendRoutes(limit);
        return routes.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public void incrementViewCount(Long id) {
        tourRouteMapper.incrementViewCount(id);
    }

    private void saveItems(Long routeId, List<RouteItemDTO> itemDTOs) {
        if (itemDTOs == null || itemDTOs.isEmpty()) return;
        for (RouteItemDTO dto : itemDTOs) {
            RouteItem item = new RouteItem();
            item.setRouteId(routeId);
            item.setDayNumber(dto.getDayNumber());
            item.setSortOrder(dto.getSortOrder());
            item.setAttractionId(dto.getAttractionId());
            item.setSuggestedDuration(dto.getSuggestedDuration());
            item.setTransportMethod(dto.getTransportMethod());
            item.setNote(dto.getNote());
            item.setCreatedAt(LocalDateTime.now());
            item.setUpdatedAt(LocalDateTime.now());
            routeItemMapper.insert(item);
        }
    }

    private TourRouteDTO toDTO(TourRoute route) {
        TourRouteDTO dto = BeanCopyUtils.copyBean(route, TourRouteDTO.class);
        if (StringUtils.hasText(route.getTags())) {
            dto.setTags(Arrays.asList(route.getTags().split(",")));
        } else {
            dto.setTags(Collections.emptyList());
        }
        dto.setDifficultyLabel(getDifficultyLabel(route.getDifficulty()));
        return dto;
    }

    private TourRoute toEntity(TourRouteDTO dto) {
        TourRoute route = BeanCopyUtils.copyBean(dto, TourRoute.class);
        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            route.setTags(String.join(",", dto.getTags()));
        }
        return route;
    }

    private String getDifficultyLabel(String difficulty) {
        if ("easy".equals(difficulty)) return "简单";
        if ("medium".equals(difficulty)) return "中等";
        if ("hard".equals(difficulty)) return "困难";
        return difficulty;
    }
}

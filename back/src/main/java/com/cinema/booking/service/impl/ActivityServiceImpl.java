package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.ActivityDTO;
import com.cinema.booking.dto.ActivityRegistrationDTO;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.entity.Activity;
import com.cinema.booking.entity.ActivityRegistration;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.ActivityMapper;
import com.cinema.booking.mapper.ActivityRegistrationMapper;
import com.cinema.booking.security.SecurityService;
import com.cinema.booking.service.ActivityService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter DATE_TIME_WITH_SECONDS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final ActivityMapper activityMapper;
    private final ActivityRegistrationMapper activityRegistrationMapper;
    private final ObjectMapper objectMapper;
    private final SecurityService securityService;

    @Override
    @Cacheable(value = "activities", key = "'page:' + #pageRequest.pageNum + ':' + #pageRequest.pageSize + ':' + (#keyword == null ? '' : #keyword) + ':' + (#category == null ? '' : #category) + ':' + (#status == null ? '' : #status)")
    public IPage<ActivityDTO> getActivityPage(PageRequest pageRequest, String keyword, String category, String status) {
        Page<Activity> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getDeleted, false);
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Activity::getTitle, keyword).or().like(Activity::getLocation, keyword));
        }
        if (StringUtils.hasText(category)) {
            wrapper.eq(Activity::getCategory, category);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(Activity::getStatus, status);
        }
        wrapper.orderByDesc(Activity::getStartTime).orderByDesc(Activity::getCreatedAt);
        return activityMapper.selectPage(page, wrapper).convert(this::toDTO);
    }

    @Override
    @Cacheable(value = "activities", key = "'detail:' + #id")
    public ActivityDTO getActivityById(Long id) {
        Activity activity = getActivityEntity(id);
        return toDTO(activity);
    }

    @Override
    public List<ActivityDTO> getActivitiesByDate(String date) {
        LocalDate targetDate = LocalDate.parse(date, DATE_FORMATTER);
        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay().minusSeconds(1);

        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getDeleted, false)
                .le(Activity::getStartTime, end)
                .ge(Activity::getEndTime, start)
                .orderByAsc(Activity::getStartTime);
        return activityMapper.selectList(wrapper).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<ActivityDTO> getMonthActivities(Integer year, Integer month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime end = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getDeleted, false)
                .le(Activity::getStartTime, end)
                .ge(Activity::getEndTime, start)
                .orderByAsc(Activity::getStartTime);
        return activityMapper.selectList(wrapper).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "activities", allEntries = true)
    public ActivityRegistrationDTO registerActivity(ActivityRegistrationDTO dto) {
        Activity activity = getActivityEntity(dto.getActivityId());
        String resolvedStatus = resolveStatus(activity);
        if ("ended".equals(resolvedStatus)) {
            throw new ServiceException("活动已结束，无法报名");
        }
        if ("full".equals(resolvedStatus)) {
            throw new ServiceException("活动名额已满");
        }
        if (activity.getRegistrationDeadline() != null && LocalDateTime.now().isAfter(activity.getRegistrationDeadline())) {
            throw new ServiceException("报名已截止");
        }

        int participantCount = dto.getParticipantCount() == null ? 1 : dto.getParticipantCount();
        int maxParticipants = activity.getMaxParticipants() == null ? 0 : activity.getMaxParticipants();
        int currentParticipants = activity.getCurrentParticipants() == null ? 0 : activity.getCurrentParticipants();
        if (maxParticipants > 0 && currentParticipants + participantCount > maxParticipants) {
            throw new ServiceException("报名人数超过剩余名额");
        }

        ActivityRegistration registration = new ActivityRegistration();
        registration.setActivityId(activity.getId());
        registration.setUserId(securityService.getCurrentUserId());
        registration.setContactName(dto.getContactName());
        registration.setContactPhone(dto.getContactPhone());
        registration.setParticipantCount(participantCount);
        registration.setRemark(dto.getRemark());
        registration.setStatus("pending");
        registration.setCreatedAt(LocalDateTime.now());
        registration.setUpdatedAt(LocalDateTime.now());
        registration.setDeleted(false);
        activityRegistrationMapper.insert(registration);

        activity.setCurrentParticipants(currentParticipants + participantCount);
        activity.setStatus(resolveStatus(activity));
        activity.setUpdatedAt(LocalDateTime.now());
        activityMapper.updateById(activity);

        return toRegistrationDTO(registration, activity);
    }

    @Override
    public List<ActivityDTO> getRelatedActivities(Long activityId, Integer limit) {
        Activity current = getActivityEntity(activityId);
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getDeleted, false)
                .eq(Activity::getCategory, current.getCategory())
                .ne(Activity::getId, activityId)
                .orderByAsc(Activity::getStartTime);
        return activityMapper.selectList(wrapper).stream()
                .map(this::toDTO)
                .limit(limit == null ? 3 : limit)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "activities", allEntries = true)
    public ActivityDTO createActivity(ActivityDTO dto) {
        Activity entity = toEntity(dto);
        entity.setCurrentParticipants(dto.getCurrentParticipants() == null ? 0 : dto.getCurrentParticipants());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setDeleted(false);
        entity.setStatus(resolveStatus(entity));
        activityMapper.insert(entity);
        return toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "activities", allEntries = true)
    public ActivityDTO updateActivity(Long id, ActivityDTO dto) {
        Activity existing = getActivityEntity(id);
        Activity entity = toEntity(dto);
        entity.setId(id);
        entity.setCreatedAt(existing.getCreatedAt());
        entity.setDeleted(existing.getDeleted());
        entity.setCurrentParticipants(dto.getCurrentParticipants() == null ? existing.getCurrentParticipants() : dto.getCurrentParticipants());
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setStatus(resolveStatus(entity));
        activityMapper.updateById(entity);
        return toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "activities", allEntries = true)
    public void deleteActivity(Long id) {
        Activity existing = getActivityEntity(id);
        existing.setDeleted(true);
        existing.setUpdatedAt(LocalDateTime.now());
        activityMapper.updateById(existing);
    }

    @Override
    public IPage<ActivityRegistrationDTO> getRegistrationPage(PageRequest pageRequest, Long activityId, String status) {
        Page<ActivityRegistration> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<ActivityRegistration> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ActivityRegistration::getDeleted, false);
        if (activityId != null) {
            wrapper.eq(ActivityRegistration::getActivityId, activityId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(ActivityRegistration::getStatus, status);
        }
        wrapper.orderByDesc(ActivityRegistration::getCreatedAt);

        IPage<ActivityRegistration> registrationPage = activityRegistrationMapper.selectPage(page, wrapper);
        List<Long> activityIds = registrationPage.getRecords().stream()
                .map(ActivityRegistration::getActivityId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        final Map<Long, Activity> activityMap = activityIds.isEmpty()
                ? new HashMap<>()
                : activityMapper.selectBatchIds(activityIds).stream()
                .collect(Collectors.toMap(Activity::getId, item -> item));

        Page<ActivityRegistrationDTO> result = new Page<>(registrationPage.getCurrent(), registrationPage.getSize(), registrationPage.getTotal());
        result.setRecords(registrationPage.getRecords().stream()
                .map(item -> toRegistrationDTO(item, activityMap.get(item.getActivityId())))
                .collect(Collectors.toList()));
        return result;
    }

    @Override
    @Transactional
    public void confirmRegistration(Long id) {
        ActivityRegistration registration = getRegistrationEntity(id);
        if ("cancelled".equals(registration.getStatus())) {
            throw new ServiceException("已取消的报名记录不能确认");
        }
        registration.setStatus("confirmed");
        registration.setUpdatedAt(LocalDateTime.now());
        activityRegistrationMapper.updateById(registration);
    }

    @Override
    @Transactional
    public void cancelRegistration(Long id) {
        ActivityRegistration registration = getRegistrationEntity(id);
        if ("cancelled".equals(registration.getStatus())) {
            return;
        }

        Activity activity = getActivityEntity(registration.getActivityId());
        int currentParticipants = activity.getCurrentParticipants() == null ? 0 : activity.getCurrentParticipants();
        int nextParticipants = Math.max(0, currentParticipants - (registration.getParticipantCount() == null ? 0 : registration.getParticipantCount()));
        activity.setCurrentParticipants(nextParticipants);
        activity.setStatus(resolveStatus(activity));
        activity.setUpdatedAt(LocalDateTime.now());
        activityMapper.updateById(activity);

        registration.setStatus("cancelled");
        registration.setUpdatedAt(LocalDateTime.now());
        activityRegistrationMapper.updateById(registration);
    }

    @Override
    @Transactional
    public void cancelMyRegistration(Long registrationId, Long userId) {
        ActivityRegistration registration = getRegistrationEntity(registrationId);
        if (!registration.getUserId().equals(userId)) {
            throw new ServiceException("无权操作他人报名");
        }
        if ("cancelled".equals(registration.getStatus())) {
            return;
        }
        Activity activity = getActivityEntity(registration.getActivityId());
        int currentParticipants = activity.getCurrentParticipants() == null ? 0 : activity.getCurrentParticipants();
        int nextParticipants = Math.max(0, currentParticipants - (registration.getParticipantCount() == null ? 0 : registration.getParticipantCount()));
        activity.setCurrentParticipants(nextParticipants);
        activity.setStatus(resolveStatus(activity));
        activity.setUpdatedAt(LocalDateTime.now());
        activityMapper.updateById(activity);

        registration.setStatus("cancelled");
        registration.setUpdatedAt(LocalDateTime.now());
        activityRegistrationMapper.updateById(registration);
    }

    @Override
    public IPage<ActivityRegistrationDTO> getMyRegistrations(PageRequest pageRequest, Long userId, String status) {
        Page<ActivityRegistration> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<ActivityRegistration> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ActivityRegistration::getDeleted, false);
        wrapper.eq(ActivityRegistration::getUserId, userId);
        if (status != null && !status.isEmpty()) {
            wrapper.eq(ActivityRegistration::getStatus, status);
        }
        wrapper.orderByDesc(ActivityRegistration::getCreatedAt);

        IPage<ActivityRegistration> registrationPage = activityRegistrationMapper.selectPage(page, wrapper);
        java.util.List<Long> activityIds = registrationPage.getRecords().stream()
                .map(ActivityRegistration::getActivityId)
                .distinct()
                .collect(Collectors.toList());
        java.util.Map<Long, Activity> activityMap = activityIds.isEmpty()
                ? java.util.Collections.emptyMap()
                : activityMapper.selectBatchIds(activityIds).stream()
                    .collect(Collectors.toMap(Activity::getId, a -> a));

        Page<ActivityRegistrationDTO> result = new Page<>(registrationPage.getCurrent(), registrationPage.getSize(), registrationPage.getTotal());
        result.setRecords(registrationPage.getRecords().stream()
                .map(r -> toRegistrationDTO(r, activityMap.get(r.getActivityId())))
                .collect(Collectors.toList()));
        return result;
    }

    private Activity getActivityEntity(Long id) {
        Activity activity = activityMapper.selectById(id);
        if (activity == null || Boolean.TRUE.equals(activity.getDeleted())) {
            throw new ServiceException("活动不存在");
        }
        return activity;
    }

    private ActivityRegistration getRegistrationEntity(Long id) {
        ActivityRegistration registration = activityRegistrationMapper.selectById(id);
        if (registration == null || Boolean.TRUE.equals(registration.getDeleted())) {
            throw new ServiceException("报名记录不存在");
        }
        return registration;
    }

    private ActivityDTO toDTO(Activity entity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setCoverImages(parseJsonArray(entity.getCoverImages()));
        dto.setDescription(entity.getDescription());
        dto.setCategory(entity.getCategory());
        dto.setStartTime(formatDateTime(entity.getStartTime()));
        dto.setEndTime(formatDateTime(entity.getEndTime()));
        dto.setLocation(entity.getLocation());
        dto.setOrganizer(entity.getOrganizer());
        dto.setContactPhone(entity.getContactPhone());
        dto.setFee(entity.getFee() == null ? BigDecimal.ZERO : entity.getFee());
        dto.setFeeText(buildFeeText(entity.getFee()));
        dto.setMaxParticipants(entity.getMaxParticipants() == null ? 0 : entity.getMaxParticipants());
        dto.setCurrentParticipants(entity.getCurrentParticipants() == null ? 0 : entity.getCurrentParticipants());
        dto.setRegistrationDeadline(formatDateTime(entity.getRegistrationDeadline()));
        dto.setStatus(resolveStatus(entity));
        dto.setImages(parseJsonArray(entity.getImages()));
        dto.setTags(parseJsonArray(entity.getTags()));
        dto.setCreatedAt(formatDate(entity.getCreatedAt()));
        return dto;
    }

    private Activity toEntity(ActivityDTO dto) {
        Activity entity = new Activity();
        entity.setTitle(dto.getTitle());
        entity.setCoverImages(toJsonString(dto.getCoverImages()));
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory());
        entity.setStartTime(parseDateTime(dto.getStartTime()));
        entity.setEndTime(parseDateTime(dto.getEndTime()));
        entity.setLocation(dto.getLocation());
        entity.setOrganizer(dto.getOrganizer());
        entity.setContactPhone(dto.getContactPhone());
        entity.setFee(dto.getFee() == null ? BigDecimal.ZERO : dto.getFee());
        entity.setMaxParticipants(dto.getMaxParticipants() == null ? 0 : dto.getMaxParticipants());
        entity.setCurrentParticipants(dto.getCurrentParticipants() == null ? 0 : dto.getCurrentParticipants());
        entity.setRegistrationDeadline(parseNullableDateTime(dto.getRegistrationDeadline()));
        entity.setStatus(dto.getStatus());
        entity.setImages(toJsonString(dto.getImages()));
        entity.setTags(toJsonString(dto.getTags()));
        return entity;
    }

    private ActivityRegistrationDTO toRegistrationDTO(ActivityRegistration registration, Activity activity) {
        ActivityRegistrationDTO dto = new ActivityRegistrationDTO();
        dto.setId(registration.getId());
        dto.setActivityId(registration.getActivityId());
        dto.setUserId(registration.getUserId());
        dto.setActivityTitle(activity != null ? activity.getTitle() : null);
        dto.setContactName(registration.getContactName());
        dto.setContactPhone(registration.getContactPhone());
        dto.setParticipantCount(registration.getParticipantCount());
        dto.setRemark(registration.getRemark());
        dto.setStatus(registration.getStatus());
        dto.setCreatedAt(formatDate(registration.getCreatedAt()));
        return dto;
    }

    private String buildFeeText(BigDecimal fee) {
        if (fee == null || fee.compareTo(BigDecimal.ZERO) == 0) {
            return "免费";
        }
        BigDecimal normalized = fee.stripTrailingZeros().setScale(Math.max(fee.stripTrailingZeros().scale(), 0), RoundingMode.UNNECESSARY);
        return "¥" + normalized.toPlainString() + "/人";
    }

    private String resolveStatus(Activity activity) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endTime = activity.getEndTime();
        if (endTime != null && now.isAfter(endTime)) {
            return "ended";
        }

        int maxParticipants = activity.getMaxParticipants() == null ? 0 : activity.getMaxParticipants();
        int currentParticipants = activity.getCurrentParticipants() == null ? 0 : activity.getCurrentParticipants();
        if (maxParticipants > 0 && currentParticipants >= maxParticipants) {
            return "full";
        }

        LocalDateTime startTime = activity.getStartTime();
        if (startTime != null && !now.isBefore(startTime) && (endTime == null || now.isBefore(endTime))) {
            return "ongoing";
        }

        return "registering";
    }

    private List<String> parseJsonArray(String json) {
        if (!StringUtils.hasText(json)) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }

    private String toJsonString(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private LocalDateTime parseDateTime(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDateTime.parse(value, DATE_TIME_WITH_SECONDS_FORMATTER);
        } catch (Exception ignored) {
        }
        try {
            return LocalDateTime.parse(value, DATE_TIME_FORMATTER);
        } catch (Exception ignored) {
        }
        return LocalDate.parse(value, DATE_FORMATTER).atStartOfDay();
    }

    private LocalDateTime parseNullableDateTime(String value) {
        return StringUtils.hasText(value) ? parseDateTime(value) : null;
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.format(DATE_TIME_FORMATTER);
    }

    private String formatDate(LocalDateTime value) {
        return value == null ? null : value.format(DATE_FORMATTER);
    }
}

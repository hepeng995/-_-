package com.cinema.booking.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.ActivityDTO;
import com.cinema.booking.dto.ActivityRegistrationDTO;
import com.cinema.booking.dto.PageRequest;

import java.util.List;

public interface ActivityService {

    IPage<ActivityDTO> getActivityPage(PageRequest pageRequest, String keyword, String category, String status);

    ActivityDTO getActivityById(Long id);

    List<ActivityDTO> getActivitiesByDate(String date);

    List<ActivityDTO> getMonthActivities(Integer year, Integer month);

    ActivityRegistrationDTO registerActivity(ActivityRegistrationDTO dto);

    List<ActivityDTO> getRelatedActivities(Long activityId, Integer limit);

    ActivityDTO createActivity(ActivityDTO dto);

    ActivityDTO updateActivity(Long id, ActivityDTO dto);

    void deleteActivity(Long id);

    IPage<ActivityRegistrationDTO> getRegistrationPage(PageRequest pageRequest, Long activityId, String status);

    void confirmRegistration(Long id);

    void cancelRegistration(Long id);

    /**
     * 用户取消自己的活动报名（仅本人可操作）
     */
    void cancelMyRegistration(Long registrationId, Long userId);

    /**
     * 查询当前用户的活动报名列表
     */
    IPage<ActivityRegistrationDTO> getMyRegistrations(PageRequest pageRequest, Long userId, String status);
}

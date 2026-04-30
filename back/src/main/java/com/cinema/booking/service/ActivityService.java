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
}

package com.cinema.booking.service.impl;

import com.cinema.booking.dto.ActivityRegistrationDTO;
import com.cinema.booking.entity.Activity;
import com.cinema.booking.entity.ActivityRegistration;
import com.cinema.booking.mapper.ActivityMapper;
import com.cinema.booking.mapper.ActivityRegistrationMapper;
import com.cinema.booking.security.SecurityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ActivityServiceImplTest {

    @Test
    void registerActivityUpdatesParticipantCountAndFullStatus() {
        ActivityMapper activityMapper = mock(ActivityMapper.class);
        ActivityRegistrationMapper activityRegistrationMapper = mock(ActivityRegistrationMapper.class);
        SecurityService securityService = mock(SecurityService.class);

        Activity activity = Activity.builder()
                .id(1L)
                .title("春日茶园采摘体验")
                .category("picking")
                .fee(new BigDecimal("128.00"))
                .maxParticipants(5)
                .currentParticipants(4)
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(2).plusHours(8))
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .deleted(false)
                .build();
        when(activityMapper.selectById(1L)).thenReturn(activity);
        doAnswer(invocation -> {
            ActivityRegistration entity = invocation.getArgument(0);
            entity.setId(9L);
            return 1;
        }).when(activityRegistrationMapper).insert(any(ActivityRegistration.class));

        ActivityServiceImpl service = new ActivityServiceImpl(
                activityMapper,
                activityRegistrationMapper,
                new ObjectMapper(),
                securityService
        );

        ActivityRegistrationDTO dto = new ActivityRegistrationDTO();
        dto.setActivityId(1L);
        dto.setContactName("张三");
        dto.setContactPhone("13800138001");
        dto.setParticipantCount(1);

        ActivityRegistrationDTO result = service.registerActivity(dto);

        assertEquals(9L, result.getId());
        assertEquals("pending", result.getStatus());
        assertEquals(5, activity.getCurrentParticipants());
        assertEquals("full", activity.getStatus());
    }

    @Test
    void cancelRegistrationRestoresParticipantCount() {
        ActivityMapper activityMapper = mock(ActivityMapper.class);
        ActivityRegistrationMapper activityRegistrationMapper = mock(ActivityRegistrationMapper.class);
        SecurityService securityService = mock(SecurityService.class);

        ActivityRegistration registration = ActivityRegistration.builder()
                .id(10L)
                .activityId(2L)
                .participantCount(2)
                .status("confirmed")
                .deleted(false)
                .build();

        Activity activity = Activity.builder()
                .id(2L)
                .title("非遗竹编手作课堂")
                .category("workshop")
                .fee(new BigDecimal("68.00"))
                .maxParticipants(15)
                .currentParticipants(5)
                .startTime(LocalDateTime.now().plusDays(3))
                .endTime(LocalDateTime.now().plusDays(3).plusHours(3))
                .deleted(false)
                .build();

        when(activityRegistrationMapper.selectById(10L)).thenReturn(registration);
        when(activityMapper.selectById(2L)).thenReturn(activity);

        ActivityServiceImpl service = new ActivityServiceImpl(
                activityMapper,
                activityRegistrationMapper,
                new ObjectMapper(),
                securityService
        );

        service.cancelRegistration(10L);

        assertEquals("cancelled", registration.getStatus());
        assertEquals(3, activity.getCurrentParticipants());
        assertEquals("registering", activity.getStatus());
    }
}

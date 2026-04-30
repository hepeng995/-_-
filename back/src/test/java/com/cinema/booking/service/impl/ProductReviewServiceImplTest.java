package com.cinema.booking.service.impl;

import com.cinema.booking.dto.ProductReviewDTO;
import com.cinema.booking.entity.ProductReview;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.OrderMapper;
import com.cinema.booking.mapper.ProductReviewMapper;
import com.cinema.booking.mapper.ReviewHelpfulMapper;
import com.cinema.booking.security.SecurityService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProductReviewServiceImplTest {

    @Test
    void createReviewRejectsWhenNoCompletedOrderCanBeReviewed() {
        ProductReviewMapper productReviewMapper = mock(ProductReviewMapper.class);
        ReviewHelpfulMapper reviewHelpfulMapper = mock(ReviewHelpfulMapper.class);
        ProductReviewStatsService productReviewStatsService = mock(ProductReviewStatsService.class);
        SecurityService securityService = mock(SecurityService.class);
        OrderMapper orderMapper = mock(OrderMapper.class);

        when(orderMapper.selectLatestReviewableOrderId(1L, 2L)).thenReturn(null);

        ProductReviewServiceImpl service = new ProductReviewServiceImpl(
                productReviewMapper,
                reviewHelpfulMapper,
                productReviewStatsService,
                securityService,
                orderMapper
        );

        ProductReviewDTO dto = new ProductReviewDTO();
        dto.setUserId(1L);
        dto.setProductId(2L);
        dto.setRating(5);
        dto.setContent("很好");

        ServiceException ex = assertThrows(ServiceException.class, () -> service.createReview(dto));
        assertEquals("未找到可评价的已完成订单", ex.getMessage());
    }

    @Test
    void createReviewRejectsDuplicateReviewForSameOrder() {
        ProductReviewMapper productReviewMapper = mock(ProductReviewMapper.class);
        ReviewHelpfulMapper reviewHelpfulMapper = mock(ReviewHelpfulMapper.class);
        ProductReviewStatsService productReviewStatsService = mock(ProductReviewStatsService.class);
        SecurityService securityService = mock(SecurityService.class);
        OrderMapper orderMapper = mock(OrderMapper.class);

        when(orderMapper.countCompletedOrderItemsForReview(1L, 2L, 9L)).thenReturn(1);
        when(productReviewMapper.checkUserReviewed(1L, 2L, 9L)).thenReturn(1);

        ProductReviewServiceImpl service = new ProductReviewServiceImpl(
                productReviewMapper,
                reviewHelpfulMapper,
                productReviewStatsService,
                securityService,
                orderMapper
        );

        ProductReviewDTO dto = new ProductReviewDTO();
        dto.setUserId(1L);
        dto.setProductId(2L);
        dto.setOrderId(9L);
        dto.setRating(4);
        dto.setContent("重复评价");

        ServiceException ex = assertThrows(ServiceException.class, () -> service.createReview(dto));
        assertEquals("该订单中的商品已经评价过了", ex.getMessage());
    }

    @Test
    void createReviewUsesResolvedOrderIdFromEligibilityQuery() {
        ProductReviewMapper productReviewMapper = mock(ProductReviewMapper.class);
        ReviewHelpfulMapper reviewHelpfulMapper = mock(ReviewHelpfulMapper.class);
        ProductReviewStatsService productReviewStatsService = mock(ProductReviewStatsService.class);
        SecurityService securityService = mock(SecurityService.class);
        OrderMapper orderMapper = mock(OrderMapper.class);

        when(orderMapper.selectLatestReviewableOrderId(1L, 2L)).thenReturn(88L);
        when(productReviewMapper.checkUserReviewed(1L, 2L, 88L)).thenReturn(0);
        doAnswer(invocation -> {
            ProductReview entity = invocation.getArgument(0);
            entity.setId(99L);
            return 1;
        }).when(productReviewMapper).insert(any(ProductReview.class));

        ProductReviewDTO saved = new ProductReviewDTO();
        saved.setId(99L);
        saved.setUserId(1L);
        saved.setProductId(2L);
        saved.setOrderId(88L);
        saved.setRating(5);
        saved.setContent("评价成功");
        when(productReviewMapper.selectReviewById(99L, 1L)).thenReturn(saved);

        ProductReviewServiceImpl service = new ProductReviewServiceImpl(
                productReviewMapper,
                reviewHelpfulMapper,
                productReviewStatsService,
                securityService,
                orderMapper
        );

        ProductReviewDTO dto = new ProductReviewDTO();
        dto.setUserId(1L);
        dto.setProductId(2L);
        dto.setRating(5);
        dto.setContent("评价成功");

        ProductReviewDTO result = service.createReview(dto);
        assertEquals(88L, result.getOrderId());
        assertEquals(99L, result.getId());
    }
}

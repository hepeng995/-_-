package com.cinema.booking.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 评价回复DTO
 */
@Data
public class ReviewReplyDTO {
    
    /**
     * 评价ID
     */
    @NotNull(message = "评价ID不能为空")
    private Long reviewId;
    
    /**
     * 回复内容
     */
    @NotBlank(message = "回复内容不能为空")
    private String replyContent;
}

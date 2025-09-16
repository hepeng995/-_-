package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cinema.booking.entity.ReviewHelpful;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 评价有用Mapper接口
 */
@Mapper
public interface ReviewHelpfulMapper extends BaseMapper<ReviewHelpful> {
    
    /**
     * 检查用户是否已点赞评价
     */
    Integer checkUserHelpful(@Param("userId") Long userId, @Param("reviewId") Long reviewId);
    
    /**
     * 删除用户点赞记录
     */
    Integer deleteUserHelpful(@Param("userId") Long userId, @Param("reviewId") Long reviewId);
}

package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cinema.booking.entity.ForumPostLike;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 帖子点赞Mapper接口
 */
@Mapper
public interface ForumPostLikeMapper extends BaseMapper<ForumPostLike> {
    
    /**
     * 检查用户是否已点赞帖子
     */
    boolean existsByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);
    
    /**
     * 删除用户对帖子的点赞
     */
    int deleteByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);
    
    /**
     * 统计帖子点赞数
     */
    Long countByPostId(@Param("postId") Long postId);
}

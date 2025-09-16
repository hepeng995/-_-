package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cinema.booking.entity.ForumCommentLike;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 评论点赞Mapper接口
 */
@Mapper
public interface ForumCommentLikeMapper extends BaseMapper<ForumCommentLike> {
    
    /**
     * 检查用户是否已点赞评论
     */
    boolean existsByCommentIdAndUserId(@Param("commentId") Long commentId, @Param("userId") Long userId);
    
    /**
     * 删除用户对评论的点赞
     */
    int deleteByCommentIdAndUserId(@Param("commentId") Long commentId, @Param("userId") Long userId);
    
    /**
     * 统计评论点赞数
     */
    Long countByCommentId(@Param("commentId") Long commentId);
}

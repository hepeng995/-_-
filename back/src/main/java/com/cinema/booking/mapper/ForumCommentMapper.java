package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.ForumCommentDTO;
import com.cinema.booking.dto.ForumCommentQueryDTO;
import com.cinema.booking.entity.ForumComment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 论坛评论Mapper接口
 */
@Mapper
public interface ForumCommentMapper extends BaseMapper<ForumComment> {
    
    /**
     * 分页查询评论列表（包含用户信息）
     */
    IPage<ForumCommentDTO> selectCommentsWithUserInfo(Page<ForumCommentDTO> page, @Param("query") ForumCommentQueryDTO query, @Param("currentUserId") Long currentUserId);
    
    /**
     * 根据帖子ID查询评论列表（包含用户信息和回复）
     */
    List<ForumCommentDTO> selectCommentsByPostId(@Param("postId") Long postId, @Param("currentUserId") Long currentUserId);
    
    /**
     * 根据父评论ID查询回复列表
     */
    List<ForumCommentDTO> selectRepliesByParentId(@Param("parentId") Long parentId, @Param("currentUserId") Long currentUserId);
    
    /**
     * 根据ID查询评论详情（包含用户信息）
     */
    ForumCommentDTO selectCommentWithUserInfoById(@Param("id") Long id, @Param("currentUserId") Long currentUserId);
    
    /**
     * 更新点赞数
     */
    void updateLikeCount(@Param("id") Long id, @Param("count") int count);
    
    /**
     * 根据帖子ID统计评论数
     */
    Long countByPostId(@Param("postId") Long postId);
    
    /**
     * 删除评论相关的点赞记录
     */
    void deleteCommentLikes(@Param("commentId") Long commentId);
}

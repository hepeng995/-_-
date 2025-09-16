package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.ForumPostDTO;
import com.cinema.booking.dto.ForumPostQueryDTO;
import com.cinema.booking.dto.ForumStatisticsDTO;
import com.cinema.booking.entity.ForumPost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 论坛帖子Mapper接口
 */
@Mapper
public interface ForumPostMapper extends BaseMapper<ForumPost> {
    
    /**
     * 分页查询帖子列表（包含用户信息）
     */
    IPage<ForumPostDTO> selectPostsWithUserInfo(Page<ForumPostDTO> page, @Param("query") ForumPostQueryDTO query, @Param("currentUserId") Long currentUserId);
    
    /**
     * 根据ID查询帖子详情（包含用户信息）
     */
    ForumPostDTO selectPostWithUserInfoById(@Param("id") Long id, @Param("currentUserId") Long currentUserId);
    
    /**
     * 增加浏览次数
     */
    void incrementViewCount(@Param("id") Long id);
    
    /**
     * 更新点赞数
     */
    void updateLikeCount(@Param("id") Long id, @Param("count") int count);
    
    /**
     * 更新评论数
     */
    void updateCommentCount(@Param("id") Long id, @Param("count") int count);
    
    /**
     * 重新计算并更新帖子的评论数
     */
    void recalculateCommentCount(@Param("postId") Long postId);
    
    /**
     * 获取分类统计
     */
    List<ForumStatisticsDTO.CategoryStatistics> getCategoryStatistics();
    
    /**
     * 获取状态统计
     */
    List<Map<String, Object>> getStatusStatistics();
    
    /**
     * 获取热门帖子
     */
    List<ForumPostDTO> getHotPosts(@Param("limit") int limit, @Param("currentUserId") Long currentUserId);
    
    /**
     * 获取最新帖子
     */
    List<ForumPostDTO> getLatestPosts(@Param("limit") int limit, @Param("currentUserId") Long currentUserId);
    
    /**
     * 获取月度统计数据
     */
    List<ForumStatisticsDTO.MonthlyStatistics> getMonthlyStatistics(@Param("months") int months);
    
    /**
     * 获取评论总数
     */
    Long getTotalCommentsCount();
    
    /**
     * 删除帖子相关的点赞记录
     */
    void deletePostLikes(@Param("postId") Long postId);
    
    /**
     * 删除帖子相关的评论点赞记录
     */
    void deletePostCommentLikes(@Param("postId") Long postId);
    
    /**
     * 删除帖子相关的评论
     */
    void deletePostComments(@Param("postId") Long postId);
    
    /**
     * 强制更新帖子（包括images字段）
     */
    void forceUpdatePost(ForumPost post);
}

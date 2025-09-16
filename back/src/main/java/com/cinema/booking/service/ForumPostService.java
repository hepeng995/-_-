package com.cinema.booking.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.ForumPostDTO;
import com.cinema.booking.dto.ForumPostQueryDTO;
import com.cinema.booking.dto.ForumStatisticsDTO;

/**
 * 论坛帖子服务接口
 */
public interface ForumPostService {
    
    /**
     * 创建帖子
     */
    Long createPost(ForumPostDTO postDTO);
    
    /**
     * 更新帖子
     */
    void updatePost(Long id, ForumPostDTO postDTO);
    
    /**
     * 删除帖子
     */
    void deletePost(Long id);
    
    /**
     * 根据ID获取帖子详情
     */
    ForumPostDTO getPostById(Long id);
    
    /**
     * 分页查询帖子列表
     */
    IPage<ForumPostDTO> getPostsPage(ForumPostQueryDTO queryDTO);
    
    /**
     * 审核帖子
     */
    void auditPost(Long id, Integer status, String rejectReason, String adminReply);
    
    /**
     * 设置帖子置顶
     */
    void setPostTop(Long id, Boolean isTop);
    
    /**
     * 设置帖子推荐
     */
    void setPostFeatured(Long id, Boolean isFeatured);
    
    /**
     * 点赞/取消点赞帖子
     */
    boolean togglePostLike(Long postId);
    
    /**
     * 增加浏览次数
     */
    void incrementViewCount(Long id);
    
    /**
     * 获取论坛统计数据
     */
    ForumStatisticsDTO getForumStatistics();
}

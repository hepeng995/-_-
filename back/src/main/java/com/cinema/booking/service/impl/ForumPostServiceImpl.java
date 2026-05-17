package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.ForumPostDTO;
import com.cinema.booking.dto.ForumPostQueryDTO;
import com.cinema.booking.dto.ForumStatisticsDTO;
import com.cinema.booking.entity.ForumPost;
import com.cinema.booking.entity.ForumPostLike;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.utils.HtmlSanitizer;
import com.cinema.booking.mapper.ForumPostLikeMapper;
import com.cinema.booking.mapper.ForumPostMapper;
import com.cinema.booking.utils.SecurityUtils;
import com.cinema.booking.service.ForumPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 论坛帖子服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ForumPostServiceImpl implements ForumPostService {
    
    private final ForumPostMapper forumPostMapper;
    private final ForumPostLikeMapper forumPostLikeMapper;
    
    @Override
    @Transactional
    public Long createPost(ForumPostDTO postDTO) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new ServiceException("用户未登录");
        }
        
        // 创建帖子实体
        ForumPost post = ForumPost.builder()
                .title(HtmlSanitizer.cleanText(postDTO.getTitle()))
                .content(HtmlSanitizer.cleanRich(postDTO.getContent()))
                .category(postDTO.getCategory())
                .images(postDTO.getImages())
                .userId(userId)
                .status(0) // 默认待审核
                .isTop(false)
                .isFeatured(false)
                .viewCount(0)
                .likeCount(0)
                .commentCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        // 保存帖子
        forumPostMapper.insert(post);
        
        log.info("用户 {} 创建帖子成功，帖子ID: {}", userId, post.getId());
        return post.getId();
    }
    
    @Override
    @Transactional
    public void updatePost(Long id, ForumPostDTO postDTO) {
        // 检查帖子是否存在
        ForumPost existingPost = forumPostMapper.selectById(id);
        if (existingPost == null) {
            throw new ServiceException("帖子不存在");
        }
        
        // 检查权限
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!existingPost.getUserId().equals(currentUserId) && !SecurityUtils.isAdmin()) {
            throw new ServiceException("无权限修改此帖子");
        }
        
        // 更新帖子
        String imagesJson = postDTO.getImages();
        log.info("更新帖子 {}, 接收到的图片数据: {}", id, imagesJson);
        log.info("原始帖子images: {}", existingPost.getImages());
        
        // 直接使用前端传来的图片数据，确保管理员的编辑操作能够正确执行
        String finalImagesJson = imagesJson != null ? imagesJson : "[]";
        log.info("最终使用的图片数据: {}", finalImagesJson);
        
        // 构建更新对象
        ForumPost post = new ForumPost();
        post.setId(id);
        post.setTitle(HtmlSanitizer.cleanText(postDTO.getTitle()));
        post.setContent(HtmlSanitizer.cleanRich(postDTO.getContent()));
        post.setCategory(postDTO.getCategory());
        post.setImages(finalImagesJson); // 直接使用处理后的图片数据
        post.setUpdatedAt(LocalDateTime.now());
        
        // 使用自定义的强制更新方法，确保所有字段都被更新
        forumPostMapper.forceUpdatePost(post);
        log.info("帖子 {} 强制更新完成, 最终的images: {}", id, post.getImages());
        
        // 立即查询数据库验证更新结果
        ForumPost updatedPost = forumPostMapper.selectById(id);
        if (updatedPost != null) {
            log.info("验证更新结果 - 帖子 {} 数据库中的images: {}", id, updatedPost.getImages());
        } else {
            log.error("更新后查询帖子 {} 失败", id);
        }
        
        log.info("帖子 {} 更新成功", id);
    }
    
    @Override
    @Transactional
    public void deletePost(Long id) {
        // 检查帖子是否存在
        ForumPost existingPost = forumPostMapper.selectById(id);
        if (existingPost == null) {
            throw new ServiceException("帖子不存在");
        }
        
        // 检查权限
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!existingPost.getUserId().equals(currentUserId) && !SecurityUtils.isAdmin()) {
            throw new ServiceException("无权限删除此帖子");
        }
        
        // 删除帖子相关的点赞记录
        forumPostMapper.deletePostLikes(id);
        
        // 删除帖子相关的评论点赞记录
        forumPostMapper.deletePostCommentLikes(id);
        
        // 删除帖子相关的评论
        forumPostMapper.deletePostComments(id);
        
        // 物理删除帖子
        forumPostMapper.deleteById(id);
        
        log.info("帖子 {} 物理删除成功", id);
    }
    
    @Override
    public ForumPostDTO getPostById(Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ForumPostDTO postDTO = forumPostMapper.selectPostWithUserInfoById(id, currentUserId);
        
        if (postDTO == null) {
            throw new ServiceException("帖子不存在");
        }
        
        return postDTO;
    }
    
    @Override
    public IPage<ForumPostDTO> getPostsPage(ForumPostQueryDTO queryDTO) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Page<ForumPostDTO> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        return forumPostMapper.selectPostsWithUserInfo(page, queryDTO, currentUserId);
    }
    
    @Override
    @Transactional
    public void auditPost(Long id, Integer status, String rejectReason, String adminReply) {
        // 检查权限
        if (!SecurityUtils.isAdmin()) {
            throw new ServiceException("无权限审核帖子");
        }
        
        // 检查帖子是否存在
        ForumPost existingPost = forumPostMapper.selectById(id);
        if (existingPost == null) {
            throw new ServiceException("帖子不存在");
        }
        
        // 更新审核状态
        ForumPost post = ForumPost.builder()
                .id(id)
                .status(status)
                .rejectReason(status == 2 ? rejectReason : null)
                .adminReply(adminReply)
                .adminReplyTime(adminReply != null ? LocalDateTime.now() : null)
                .updatedAt(LocalDateTime.now())
                .build();
        
        forumPostMapper.updateById(post);
        
        log.info("帖子 {} 审核完成，状态: {}", id, status);
    }
    
    @Override
    @Transactional
    public void setPostTop(Long id, Boolean isTop) {
        // 检查权限
        if (!SecurityUtils.isAdmin()) {
            throw new ServiceException("无权限设置置顶");
        }
        
        ForumPost post = ForumPost.builder()
                .id(id)
                .isTop(isTop)
                .updatedAt(LocalDateTime.now())
                .build();
        
        forumPostMapper.updateById(post);
        
        log.info("帖子 {} 置顶设置: {}", id, isTop);
    }
    
    @Override
    @Transactional
    public void setPostFeatured(Long id, Boolean isFeatured) {
        // 检查权限
        if (!SecurityUtils.isAdmin()) {
            throw new ServiceException("无权限设置推荐");
        }
        
        ForumPost post = ForumPost.builder()
                .id(id)
                .isFeatured(isFeatured)
                .updatedAt(LocalDateTime.now())
                .build();
        
        forumPostMapper.updateById(post);
        
        log.info("帖子 {} 推荐设置: {}", id, isFeatured);
    }
    
    @Override
    @Transactional
    public boolean togglePostLike(Long postId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new ServiceException("用户未登录");
        }
        
        // 检查是否已点赞
        boolean isLiked = forumPostLikeMapper.existsByPostIdAndUserId(postId, userId);
        
        if (isLiked) {
            // 取消点赞
            forumPostLikeMapper.deleteByPostIdAndUserId(postId, userId);
            forumPostMapper.updateLikeCount(postId, -1);
            log.info("用户 {} 取消点赞帖子 {}", userId, postId);
            return false;
        } else {
            // 点赞
            ForumPostLike like = ForumPostLike.builder()
                    .postId(postId)
                    .userId(userId)
                    .createdAt(LocalDateTime.now())
                    .build();
            forumPostLikeMapper.insert(like);
            forumPostMapper.updateLikeCount(postId, 1);
            log.info("用户 {} 点赞帖子 {}", userId, postId);
            return true;
        }
    }
    
    @Override
    public void incrementViewCount(Long id) {
        forumPostMapper.incrementViewCount(id);
    }
    
    @Override
    public ForumStatisticsDTO getForumStatistics() {
        // 获取状态统计
        Map<String, Long> statusStats = new HashMap<>();
        List<Map<String, Object>> statusList = forumPostMapper.getStatusStatistics();
        for (Map<String, Object> stat : statusList) {
            String statusType = (String) stat.get("status_type");
            Long count = ((Number) stat.get("count")).longValue();
            statusStats.put(statusType, count);
        }
        
        // 获取分类统计
        List<ForumStatisticsDTO.CategoryStatistics> categoryStatistics = forumPostMapper.getCategoryStatistics();
        
        // 获取热门帖子
        List<ForumPostDTO> hotPosts = forumPostMapper.getHotPosts(10, SecurityUtils.getCurrentUserId());
        
        // 获取最新帖子
        List<ForumPostDTO> latestPosts = forumPostMapper.getLatestPosts(10, SecurityUtils.getCurrentUserId());
        
        // 获取月度统计
        List<ForumStatisticsDTO.MonthlyStatistics> monthlyStatistics = forumPostMapper.getMonthlyStatistics(12);
        
        // 获取评论总数
        Long totalComments = forumPostMapper.getTotalCommentsCount();
        
        return ForumStatisticsDTO.builder()
                .totalPosts(statusStats.getOrDefault("total", 0L))
                .totalComments(totalComments)
                .pendingPosts(statusStats.getOrDefault("pending", 0L))
                .approvedPosts(statusStats.getOrDefault("approved", 0L))
                .rejectedPosts(statusStats.getOrDefault("rejected", 0L))
                .categoryStatistics(categoryStatistics)
                .hotPosts(hotPosts)
                .latestPosts(latestPosts)
                .monthlyStatistics(monthlyStatistics)
                .build();
    }
}

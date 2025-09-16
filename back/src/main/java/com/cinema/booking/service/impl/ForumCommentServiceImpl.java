package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.ForumCommentDTO;
import com.cinema.booking.dto.ForumCommentQueryDTO;
import com.cinema.booking.entity.ForumComment;
import com.cinema.booking.entity.ForumCommentLike;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.ForumCommentLikeMapper;
import com.cinema.booking.mapper.ForumCommentMapper;
import com.cinema.booking.mapper.ForumPostMapper;
import com.cinema.booking.utils.SecurityUtils;
import com.cinema.booking.service.ForumCommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 论坛评论服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ForumCommentServiceImpl implements ForumCommentService {
    
    private final ForumCommentMapper forumCommentMapper;
    private final ForumCommentLikeMapper forumCommentLikeMapper;
    private final ForumPostMapper forumPostMapper;
    
    @Override
    @Transactional
    public Long createComment(ForumCommentDTO commentDTO) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new ServiceException("用户未登录");
        }
        
        // 创建评论实体
        ForumComment comment = ForumComment.builder()
                .postId(commentDTO.getPostId())
                .userId(userId)
                .parentId(commentDTO.getParentId())
                .content(commentDTO.getContent())
                .images(commentDTO.getImages())
                .likeCount(0)
                .status(1) // 默认通过，可根据需要修改为待审核
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        // 保存评论
        forumCommentMapper.insert(comment);
        
        // 重新计算帖子评论数
        forumPostMapper.recalculateCommentCount(commentDTO.getPostId());
        
        log.info("用户 {} 创建评论成功，评论ID: {}", userId, comment.getId());
        return comment.getId();
    }
    
    @Override
    @Transactional
    public void updateComment(Long id, ForumCommentDTO commentDTO) {
        // 检查评论是否存在
        ForumComment existingComment = forumCommentMapper.selectById(id);
        if (existingComment == null) {
            throw new ServiceException("评论不存在");
        }
        
        // 检查权限
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!existingComment.getUserId().equals(currentUserId) && !SecurityUtils.isAdmin()) {
            throw new ServiceException("无权限修改此评论");
        }
        
        // 更新评论
        ForumComment comment = ForumComment.builder()
                .id(id)
                .content(commentDTO.getContent())
                .images(commentDTO.getImages())
                .updatedAt(LocalDateTime.now())
                .build();
        
        forumCommentMapper.updateById(comment);
        
        log.info("评论 {} 更新成功", id);
    }
    
    @Override
    @Transactional
    public void deleteComment(Long id) {
        // 检查评论是否存在
        ForumComment existingComment = forumCommentMapper.selectById(id);
        if (existingComment == null) {
            throw new ServiceException("评论不存在");
        }
        
        // 检查权限
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!existingComment.getUserId().equals(currentUserId) && !SecurityUtils.isAdmin()) {
            throw new ServiceException("无权限删除此评论");
        }
        
        // 保存帖子ID，用于后续更新评论数
        Long postId = existingComment.getPostId();
        
        // 删除相关的点赞记录
        forumCommentMapper.deleteCommentLikes(id);
        
        // 物理删除评论
        forumCommentMapper.deleteById(id);
        
        // 重新计算帖子评论数
        forumPostMapper.recalculateCommentCount(postId);
        
        log.info("评论 {} 物理删除成功", id);
    }
    
    @Override
    public ForumCommentDTO getCommentById(Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ForumCommentDTO commentDTO = forumCommentMapper.selectCommentWithUserInfoById(id, currentUserId);
        
        if (commentDTO == null) {
            throw new ServiceException("评论不存在");
        }
        
        return commentDTO;
    }
    
    @Override
    public IPage<ForumCommentDTO> getCommentsPage(ForumCommentQueryDTO queryDTO) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Page<ForumCommentDTO> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        return forumCommentMapper.selectCommentsWithUserInfo(page, queryDTO, currentUserId);
    }
    
    @Override
    public List<ForumCommentDTO> getCommentsByPostId(Long postId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        
        // 获取所有评论
        List<ForumCommentDTO> allComments = forumCommentMapper.selectCommentsByPostId(postId, currentUserId);
        
        // 构建评论树结构
        return buildCommentTree(allComments);
    }
    
    @Override
    @Transactional
    public void auditComment(Long id, Integer status) {
        // 检查权限
        if (!SecurityUtils.isAdmin()) {
            throw new ServiceException("无权限审核评论");
        }
        
        // 检查评论是否存在
        ForumComment existingComment = forumCommentMapper.selectById(id);
        if (existingComment == null) {
            throw new ServiceException("评论不存在");
        }
        
        // 更新审核状态
        ForumComment comment = ForumComment.builder()
                .id(id)
                .status(status)
                .updatedAt(LocalDateTime.now())
                .build();
        
        forumCommentMapper.updateById(comment);
        
        log.info("评论 {} 审核完成，状态: {}", id, status);
    }
    
    @Override
    @Transactional
    public boolean toggleCommentLike(Long commentId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new ServiceException("用户未登录");
        }
        
        // 检查是否已点赞
        boolean isLiked = forumCommentLikeMapper.existsByCommentIdAndUserId(commentId, userId);
        
        if (isLiked) {
            // 取消点赞
            forumCommentLikeMapper.deleteByCommentIdAndUserId(commentId, userId);
            forumCommentMapper.updateLikeCount(commentId, -1);
            log.info("用户 {} 取消点赞评论 {}", userId, commentId);
            return false;
        } else {
            // 点赞
            ForumCommentLike like = ForumCommentLike.builder()
                    .commentId(commentId)
                    .userId(userId)
                    .createdAt(LocalDateTime.now())
                    .build();
            forumCommentLikeMapper.insert(like);
            forumCommentMapper.updateLikeCount(commentId, 1);
            log.info("用户 {} 点赞评论 {}", userId, commentId);
            return true;
        }
    }
    
    @Override
    @Transactional
    public boolean unlikeComment(Long commentId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new ServiceException("用户未登录");
        }
        
        // 检查是否已点赞
        boolean isLiked = forumCommentLikeMapper.existsByCommentIdAndUserId(commentId, userId);
        
        if (isLiked) {
            // 取消点赞
            forumCommentLikeMapper.deleteByCommentIdAndUserId(commentId, userId);
            forumCommentMapper.updateLikeCount(commentId, -1);
            log.info("用户 {} 取消点赞评论 {}", userId, commentId);
            return false;
        } else {
            // 如果没有点赞，直接返回false
            log.warn("用户 {} 尝试取消点赞未点赞的评论 {}", userId, commentId);
            return false;
        }
    }
    
    /**
     * 构建评论树结构
     */
    private List<ForumCommentDTO> buildCommentTree(List<ForumCommentDTO> comments) {
        // 按父评论ID分组
        Map<Long, List<ForumCommentDTO>> commentMap = comments.stream()
                .collect(Collectors.groupingBy(comment -> 
                        comment.getParentId() != null ? comment.getParentId() : 0L));
        
        // 获取顶级评论（parentId为null的评论）
        List<ForumCommentDTO> rootComments = commentMap.getOrDefault(0L, new ArrayList<>());
        
        // 为每个顶级评论设置回复
        for (ForumCommentDTO rootComment : rootComments) {
            setReplies(rootComment, commentMap);
        }
        
        return rootComments;
    }
    
    /**
     * 递归设置回复
     */
    private void setReplies(ForumCommentDTO comment, Map<Long, List<ForumCommentDTO>> commentMap) {
        List<ForumCommentDTO> replies = commentMap.getOrDefault(comment.getId(), new ArrayList<>());
        comment.setReplies(replies);
        
        // 递归设置子回复
        for (ForumCommentDTO reply : replies) {
            setReplies(reply, commentMap);
        }
    }
}

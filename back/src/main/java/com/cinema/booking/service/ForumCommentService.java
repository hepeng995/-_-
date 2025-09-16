package com.cinema.booking.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.ForumCommentDTO;
import com.cinema.booking.dto.ForumCommentQueryDTO;

import java.util.List;

/**
 * 论坛评论服务接口
 */
public interface ForumCommentService {
    
    /**
     * 创建评论
     */
    Long createComment(ForumCommentDTO commentDTO);
    
    /**
     * 更新评论
     */
    void updateComment(Long id, ForumCommentDTO commentDTO);
    
    /**
     * 删除评论
     */
    void deleteComment(Long id);
    
    /**
     * 根据ID获取评论详情
     */
    ForumCommentDTO getCommentById(Long id);
    
    /**
     * 分页查询评论列表
     */
    IPage<ForumCommentDTO> getCommentsPage(ForumCommentQueryDTO queryDTO);
    
    /**
     * 根据帖子ID获取评论列表（包含回复）
     */
    List<ForumCommentDTO> getCommentsByPostId(Long postId);
    
    /**
     * 审核评论
     */
    void auditComment(Long id, Integer status);
    
    /**
     * 点赞/取消点赞评论
     */
    boolean toggleCommentLike(Long commentId);
    
    /**
     * 取消点赞评论
     */
    boolean unlikeComment(Long commentId);
}

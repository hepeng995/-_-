package com.cinema.booking.dto;

import lombok.Data;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * 论坛帖子DTO
 */
@Data
public class ForumPostDTO {
    
    private Long id;
    
    /**
     * 帖子标题
     */
    @NotBlank(message = "帖子标题不能为空")
    private String title;
    
    /**
     * 帖子内容
     */
    @NotBlank(message = "帖子内容不能为空")
    private String content;
    
    /**
     * 建议类型：environment-环境问题，infrastructure-基础设施，agriculture-农业发展，tourism-旅游发展，education-教育文化，other-其他
     */
    @NotBlank(message = "建议类型不能为空")
    private String category;
    
    /**
     * 图片集合（可以接收数组或字符串）
     */
    private Object images;
    
    /**
     * 获取图片JSON字符串
     */
    public String getImages() {
        if (images == null) {
            return "[]";
        }
        
        if (images instanceof String) {
            String imageStr = (String) images;
            // 如果是空字符串，返回空数组JSON
            if (imageStr.trim().isEmpty()) {
                return "[]";
            }
            return imageStr;
        }
        
        if (images instanceof List) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                return mapper.writeValueAsString(images);
            } catch (JsonProcessingException e) {
                return "[]";
            }
        }
        
        return "[]";
    }
    
    /**
     * 设置图片
     */
    public void setImages(Object images) {
        this.images = images;
    }
    
    /**
     * 获取图片列表
     */
    public List<String> getImageList() {
        if (images == null) {
            return new ArrayList<>();
        }
        
        if (images instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> list = (List<String>) images;
            return list;
        }
        
        if (images instanceof String) {
            String imageStr = (String) images;
            if (imageStr.isEmpty() || "null".equals(imageStr) || "[]".equals(imageStr)) {
                return new ArrayList<>();
            }
            try {
                ObjectMapper mapper = new ObjectMapper();
                return mapper.readValue(imageStr, mapper.getTypeFactory().constructCollectionType(List.class, String.class));
            } catch (JsonProcessingException e) {
                return new ArrayList<>();
            }
        }
        
        return new ArrayList<>();
    }
    
    /**
     * 发帖用户ID
     */
    private Long userId;
    
    /**
     * 审核状态：0待审核，1已通过，2已拒绝
     */
    private Integer status;
    
    /**
     * 是否置顶：0否，1是
     */
    private Boolean isTop;
    
    /**
     * 是否推荐：0否，1是
     */
    private Boolean isFeatured;
    
    /**
     * 浏览次数
     */
    private Integer viewCount;
    
    /**
     * 点赞数
     */
    private Integer likeCount;
    
    /**
     * 评论数
     */
    private Integer commentCount;
    
    /**
     * 管理员回复
     */
    private String adminReply;
    
    /**
     * 管理员回复时间
     */
    private LocalDateTime adminReplyTime;
    
    /**
     * 拒绝原因
     */
    private String rejectReason;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    // 扩展字段
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 用户真实姓名
     */
    private String realName;
    
    /**
     * 用户头像
     */
    private String userAvatar;
    
    /**
     * 状态描述
     */
    private String statusDesc;
    
    /**
     * 分类描述
     */
    private String categoryDesc;
    
    /**
     * 当前用户是否点赞了该帖子
     */
    private Boolean isLiked;
}

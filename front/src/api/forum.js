import request from './request'

// 论坛帖子相关API
export const forumPostAPI = {
  /**
   * 分页查询帖子列表
   */
  getPostList(params) {
    return request({
      url: '/forum/posts/page',
      method: 'get',
      params
    })
  },

  /**
   * 分页查询帖子列表(别名，保持兼容性)
   */
  getPostsPage(params) {
    return request({
      url: '/forum/posts/page',
      method: 'get',
      params
    })
  },

  /**
   * 获取帖子详情
   */
  getPostById(id) {
    return request({
      url: `/forum/posts/${id}`,
      method: 'get'
    })
  },

  /**
   * 创建帖子
   */
  createPost(data) {
    return request({
      url: '/forum/posts',
      method: 'post',
      data
    })
  },

  /**
   * 更新帖子
   */
  updatePost(id, data) {
    return request({
      url: `/forum/posts/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除帖子
   */
  deletePost(id) {
    return request({
      url: `/forum/posts/${id}`,
      method: 'delete'
    })
  },

  /**
   * 审核帖子
   */
  auditPost(id, status, rejectReason, adminReply) {
    return request({
      url: `/forum/posts/${id}/audit`,
      method: 'post',
      params: {
        status,
        rejectReason,
        adminReply
      }
    })
  },

  /**
   * 设置帖子置顶
   */
  setPostTop(id, isTop) {
    return request({
      url: `/forum/posts/${id}/top`,
      method: 'post',
      params: { isTop }
    })
  },

  /**
   * 设置帖子推荐
   */
  setPostFeatured(id, isFeatured) {
    return request({
      url: `/forum/posts/${id}/featured`,
      method: 'post',
      params: { isFeatured }
    })
  },

  /**
   * 点赞帖子
   */
  likePost(id) {
    return request({
      url: `/forum/posts/${id}/like`,
      method: 'post'
    })
  },

  /**
   * 取消点赞帖子
   */
  unlikePost(id) {
    return request({
      url: `/forum/posts/${id}/unlike`,
      method: 'post'
    })
  },

  /**
   * 点赞/取消点赞帖子(兼容性方法)
   */
  togglePostLike(id) {
    return request({
      url: `/forum/posts/${id}/like`,
      method: 'post'
    })
  },

  /**
   * 增加浏览次数
   */
  incrementViewCount(id) {
    return request({
      url: `/forum/posts/${id}/view`,
      method: 'post'
    })
  }
}

// 论坛评论相关API
export const forumCommentAPI = {
  /**
   * 分页查询评论列表
   */
  getCommentsPage(params) {
    return request({
      url: '/forum/comments/page',
      method: 'get',
      params
    })
  },

  /**
   * 根据帖子ID获取评论列表
   */
  getCommentsByPostId(postId) {
    return request({
      url: `/forum/comments/post/${postId}`,
      method: 'get'
    })
  },

  /**
   * 获取评论详情
   */
  getCommentById(id) {
    return request({
      url: `/forum/comments/${id}`,
      method: 'get'
    })
  },

  /**
   * 创建评论
   */
  createComment(data) {
    return request({
      url: '/forum/comments',
      method: 'post',
      data
    })
  },

  /**
   * 更新评论
   */
  updateComment(id, data) {
    return request({
      url: `/forum/comments/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除评论
   */
  deleteComment(id) {
    return request({
      url: `/forum/comments/${id}`,
      method: 'delete'
    })
  },

  /**
   * 审核评论
   */
  auditComment(id, status) {
    return request({
      url: `/forum/comments/${id}/audit`,
      method: 'post',
      params: { status }
    })
  },

  /**
   * 点赞评论
   */
  likeComment(id) {
    return request({
      url: `/forum/comments/${id}/like`,
      method: 'post'
    })
  },

  /**
   * 取消点赞评论
   */
  unlikeComment(id) {
    return request({
      url: `/forum/comments/${id}/unlike`,
      method: 'post'
    })
  },

  /**
   * 点赞/取消点赞评论(兼容性方法)
   */
  toggleCommentLike(id) {
    return request({
      url: `/forum/comments/${id}/like`,
      method: 'post'
    })
  },

  /**
   * 获取评论列表（用于详情页）
   */
  getCommentList(params) {
    return request({
      url: '/forum/comments/page',
      method: 'get',
      params
    })
  }
}

// 论坛统计相关API
export const forumStatisticsAPI = {
  /**
   * 获取论坛综合统计数据
   */
  getForumOverview() {
    return request({
      url: '/forum/statistics/overview',
      method: 'get'
    })
  },

  /**
   * 获取建议类型分布统计
   */
  getCategoryDistribution() {
    return request({
      url: '/forum/statistics/category-distribution',
      method: 'get'
    })
  },

  /**
   * 获取热度排序数据
   */
  getHotRanking() {
    return request({
      url: '/forum/statistics/hot-ranking',
      method: 'get'
    })
  },

  /**
   * 获取月度趋势数据
   */
  getMonthlyTrend() {
    return request({
      url: '/forum/statistics/monthly-trend',
      method: 'get'
    })
  },

  /**
   * 获取审核状态统计
   */
  getAuditStatus() {
    return request({
      url: '/forum/statistics/audit-status',
      method: 'get'
    })
  },

  /**
   * 获取用户公开的统计数据
   */
  getPublicStatistics() {
    return request({
      url: '/forum/statistics/public',
      method: 'get'
    })
  }
}

// 论坛工具函数
export const forumUtils = {
  /**
   * 获取建议类型名称
   */
  getCategoryName(category) {
    const categoryMap = {
      'environment': '环境问题',
      'infrastructure': '基础设施',
      'agriculture': '农业发展',
      'tourism': '旅游发展',
      'education': '教育文化',
      'other': '其他'
    }
    return categoryMap[category] || category
  },

  /**
   * 获取审核状态名称
   */
  getStatusName(status) {
    const statusMap = {
      0: '待审核',
      1: '已通过',
      2: '已拒绝'
    }
    return statusMap[status] || '未知'
  },

  /**
   * 获取状态标签类型
   */
  getStatusType(status) {
    const typeMap = {
      0: 'warning',
      1: 'success',
      2: 'danger'
    }
    return typeMap[status] || 'info'
  },

  /**
   * 获取分类选项
   */
  getCategoryOptions() {
    return [
      { label: '环境问题', value: 'environment' },
      { label: '基础设施', value: 'infrastructure' },
      { label: '农业发展', value: 'agriculture' },
      { label: '旅游发展', value: 'tourism' },
      { label: '教育文化', value: 'education' },
      { label: '其他', value: 'other' }
    ]
  }
}

export default {
  ...forumPostAPI,
  ...forumCommentAPI,
  ...forumStatisticsAPI,
  ...forumUtils
}

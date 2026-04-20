import { request } from '@/utils/request'
import type { ForumComment, ForumCommentPage, ForumPost, ForumPostPage } from '@/types/models'

export const forumApi = {
  getPostPage(params: {
    pageNum?: number
    pageSize?: number
    category?: string
    keyword?: string
    status?: number
    sortField?: string
    sortOrder?: string
  }) {
    return request<ForumPostPage>({
      url: '/forum/posts/page',
      params,
      mockKey: 'forum.page',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  getPostById(id: number | string) {
    return request<ForumPost>({
      url: `/forum/posts/${id}`,
      mockKey: 'forum.byId',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  createPost(data: Pick<ForumPost, 'title' | 'content' | 'category' | 'images'>) {
    return request<number>({
      url: '/forum/posts',
      method: 'POST',
      data,
      requiresAuth: true,
      mockKey: 'forum.create',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  togglePostLike(id: number | string) {
    return request<boolean>({
      url: `/forum/posts/${id}/like`,
      method: 'POST',
      requiresAuth: true,
      mockKey: 'forum.like',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  getCommentPage(params: {
    postId: number | string
    current?: number
    size?: number
  }) {
    return request<ForumCommentPage>({
      url: '/forum/comments/page',
      params,
      mockKey: 'forum.comments.page',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  getCommentsByPostId(postId: number | string) {
    return request<ForumComment[]>({
      url: `/forum/comments/post/${postId}`,
      mockKey: 'forum.comments.byPostId',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  createComment(data: Pick<ForumComment, 'postId' | 'content' | 'parentId'>) {
    return request<number>({
      url: '/forum/comments',
      method: 'POST',
      data,
      requiresAuth: true,
      mockKey: 'forum.comments.create',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  toggleCommentLike(id: number | string) {
    return request<boolean>({
      url: `/forum/comments/${id}/like`,
      method: 'POST',
      requiresAuth: true,
      mockKey: 'forum.comments.like',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
}

import type { ApiResponse, MockHandler, MockKey, MockRequestContext } from '@/types/api'
import type { Address, AiCard, AiChatResponse, ForumComment, ForumPost, Order, OrderItem, ProductReview, ProductReviewBundle, UserSession } from '@/types/models'
import { forumCategoryText, toNumber } from '@/utils/format'
import {
  assertAuthed,
  createPage,
  decorateForumPosts,
  getCurrentUserId,
  getForumComments,
  getHomeData,
  getProductById,
  getReviewDistribution,
  getReviewStatsForProduct,
  nextId,
  overviewData,
  productCategoryList,
  scenicCategoryList,
  state,
  toCartItem,
  recalcProductReviews,
} from './store'

const now = () => new Date().toISOString()
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const success = <T>(data: T, message = 'success'): ApiResponse<T> => ({ code: 200, data, message })
const fail = <T>(message: string, code = 400, data = null as T): ApiResponse<T> => ({ code, data, message })

const getProductReviewBundle = (context: MockRequestContext, productId: number): ProductReviewBundle => {
  const rating = context.params?.rating ? Number(context.params.rating) : null
  const hasImages = context.params?.hasImages === true || context.params?.hasImages === 'true'
  const current = Number(context.params?.current || 1)
  const size = Number(context.params?.size || 10)
  const sortBy = String(context.params?.sortBy || 'time')
  const userId = getCurrentUserId(context)
  const helpfulIds = userId ? state.helpfulReviewIds[userId] || [] : []
  let records = state.reviews.filter((item) => item.productId === productId).map((item) => ({ ...item, isHelpful: helpfulIds.includes(item.id) }))
  if (rating) records = records.filter((item) => item.rating === rating)
  if (hasImages) records = records.filter((item) => Boolean(item.images))
  records = records.sort((left, right) => {
    if (sortBy === 'helpful') return toNumber(right.helpfulCount) - toNumber(left.helpfulCount)
    if (sortBy === 'rating') return toNumber(right.rating) - toNumber(left.rating)
    return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
  })
  return {
    reviews: createPage(records, current, size),
    stats: getReviewStatsForProduct(productId),
    distribution: getReviewDistribution(productId),
  }
}

export const handlers: Record<MockKey, MockHandler> = {
  'home.overview': async () => success(clone(overviewData)),
  'home.data': async () => success(getHomeData()),
  'attraction.categories': async () => success(clone(scenicCategoryList)),
  'attraction.page': async (context) => {
    const current = Number(context.params?.pageNum || 1)
    const size = Number(context.params?.pageSize || 10)
    const keyword = String(context.params?.keyword || '').trim().toLowerCase()
    const categoryId = context.params?.categoryId ? Number(context.params.categoryId) : null
    const records = state.attractions.filter((item) => {
      const matchesKeyword = !keyword || item.name.toLowerCase().includes(keyword) || (item.description || '').toLowerCase().includes(keyword)
      const matchesCategory = !categoryId || item.categoryId === categoryId
      return item.status === 1 && matchesKeyword && matchesCategory
    })
    return success(createPage(clone(records), current, size))
  },
  'attraction.byId': async (context) => {
    const id = Number(String(context.url).split('/').pop())
    const item = state.attractions.find((entry) => entry.id === id)
    return item ? success(clone(item)) : fail('景点不存在', 404)
  },
  'attraction.byCategory': async (context) => {
    const categoryId = Number(String(context.url).split('/').pop())
    return success(clone(state.attractions.filter((item) => item.categoryId === categoryId && item.status === 1)))
  },
  'news.page': async (context) => {
    const current = Number(context.params?.pageNum || 1)
    const size = Number(context.params?.pageSize || 10)
    const category = String(context.params?.category || '')
    const keyword = String(context.params?.keyword || '').trim().toLowerCase()
    let records = state.news.slice()
    if (category) records = records.filter((item) => item.category === category)
    if (keyword) records = records.filter((item) => item.title.toLowerCase().includes(keyword) || (item.summary || '').toLowerCase().includes(keyword))
    records.sort((left, right) => new Date(right.publishTime || right.createdAt || 0).getTime() - new Date(left.publishTime || left.createdAt || 0).getTime())
    return success(createPage(clone(records), current, size))
  },
  'news.byId': async (context) => {
    const id = Number(String(context.url).split('/').pop())
    const item = state.news.find((entry) => entry.id === id)
    return item ? success(clone(item)) : fail('资讯不存在', 404)
  },
  'news.top': async (context) => {
    const limit = Number(context.params?.limit || 4)
    const records = state.news.filter((item) => item.isTop).slice(0, limit)
    return success(clone(records.length ? records : state.news.slice(0, limit)))
  },
  'product.categories': async () => success(clone(productCategoryList)),
  'product.page': async (context) => {
    const current = Number(context.params?.pageNum || 1)
    const size = Number(context.params?.pageSize || 10)
    const keyword = String(context.params?.keyword || '').trim().toLowerCase()
    const categoryId = context.params?.categoryId ? Number(context.params.categoryId) : null
    const isFeatured = context.params?.isFeatured === true || context.params?.isFeatured === 'true'
    let records = state.products.slice()
    if (categoryId) records = records.filter((item) => item.categoryId === categoryId)
    if (keyword) records = records.filter((item) => item.name.toLowerCase().includes(keyword) || (item.description || '').toLowerCase().includes(keyword))
    if (isFeatured) records = records.filter((item) => item.isFeatured)
    return success(createPage(clone(records), current, size))
  },
  'product.byId': async (context) => {
    const id = Number(String(context.url).split('/').pop())
    const item = getProductById(id)
    return item ? success(clone(item)) : fail('商品不存在', 404)
  },
  'product.byCategory': async (context) =>
    success(clone(state.products.filter((item) => item.categoryId === Number(String(context.url).split('/').pop())))),
  'product.reviews': async (context) => success(getProductReviewBundle(context, Number(String(context.url).split('/')[2]))),
  'product.reviewEligibility': async () => success({ canReview: true, hasReviewed: false, reason: null }),
  'auth.login': async (context) => {
    const payload = context.data as { username?: string; password?: string }
    const user = state.users.find((item) => item.username === payload?.username && item.password === payload?.password)
    return user ? success(clone({ ...user, password: undefined } as unknown as UserSession)) : fail('用户名或密码错误', 401)
  },
  'auth.register': async (context) => {
    const payload = context.data as { username?: string; password?: string; confirmPassword?: string; email?: string; phoneNumber?: string; realName?: string }
    if (!payload?.username || !payload.password || !payload.confirmPassword || !payload.email) return fail('请完整填写注册信息')
    if (payload.password !== payload.confirmPassword) return fail('两次输入的密码不一致')
    if (state.users.some((item) => item.username === payload.username)) return fail('用户名已存在')
    if (state.users.some((item) => item.email === payload.email)) return fail('邮箱已存在')
    const id = nextId(state.users)
    state.users.push({ id, token: `mock-token-${id}`, username: payload.username, password: payload.password, realName: payload.realName || payload.username, email: payload.email, phoneNumber: payload.phoneNumber, avatar: '/static/images/mascot.png', role: 'USER', createdAt: now() })
    state.addressesByUserId[id] = []
    state.cartByUserId[id] = []
    state.ordersByUserId[id] = []
    state.likedPostIds[id] = []
    state.likedCommentIds[id] = []
    state.helpfulReviewIds[id] = []
    return success(id)
  },
  'user.info': async (context) => {
    const user = state.users.find((item) => item.id === assertAuthed(context))
    return user ? success(clone({ ...user, password: undefined } as unknown as UserSession)) : fail('用户不存在', 404)
  },
  'user.profile.update': async (context) => {
    const user = state.users.find((item) => item.id === assertAuthed(context))
    const payload = context.data as Partial<UserSession>
    if (!user) return fail('用户不存在', 404)
    user.realName = payload.realName || user.realName
    user.email = payload.email || user.email
    user.phoneNumber = payload.phoneNumber || user.phoneNumber
    return success(null)
  },
  'user.password.change': async (context) => {
    const user = state.users.find((item) => item.id === assertAuthed(context))
    const payload = context.data as { oldPassword?: string; newPassword?: string }
    if (!user) return fail('用户不存在', 404)
    if (!payload?.oldPassword || !payload?.newPassword) return fail('请填写完整密码信息')
    if (user.password !== payload.oldPassword) return fail('当前密码不正确')
    user.password = payload.newPassword
    return success(null)
  },
  'cart.count': async (context) => {
    const userId = assertAuthed(context)
    return success((state.cartByUserId[userId] || []).reduce((sum, item) => sum + item.quantity, 0))
  },
  'cart.items': async (context) => success(clone(state.cartByUserId[assertAuthed(context)] || [])),
  'cart.add': async (context) => {
    const userId = assertAuthed(context)
    const productId = Number(context.params?.productId)
    const quantity = Number(context.params?.quantity || 1)
    const product = getProductById(productId)
    if (!product) return fail('商品不存在', 404)
    const bucket = state.cartByUserId[userId] || (state.cartByUserId[userId] = [])
    const existed = bucket.find((item) => item.productId === productId)
    if (existed) {
      existed.quantity += quantity
      existed.totalPrice = toNumber(existed.productPrice) * existed.quantity
      return success(clone(existed))
    }
    const item = toCartItem(product, quantity, nextId(bucket))
    bucket.push(item)
    return success(clone(item))
  },
  'cart.update': async (context) => {
    const userId = assertAuthed(context)
    const item = (state.cartByUserId[userId] || []).find((entry) => entry.productId === Number(context.params?.productId))
    if (!item) return fail('购物车商品不存在', 404)
    item.quantity = Number(context.params?.quantity || 1)
    item.totalPrice = toNumber(item.productPrice) * item.quantity
    return success(clone(item))
  },
  'cart.remove': async (context) => {
    const userId = assertAuthed(context)
    const productIds = (context.data as number[]) || []
    state.cartByUserId[userId] = (state.cartByUserId[userId] || []).filter((item) => !productIds.includes(item.productId))
    return success(null)
  },
  'cart.clear': async (context) => {
    state.cartByUserId[assertAuthed(context)] = []
    return success(null)
  },
  'address.list': async (context) => success(clone(state.addressesByUserId[assertAuthed(context)] || [])),
  'address.byId': async (context) => {
    const userId = assertAuthed(context)
    const item = (state.addressesByUserId[userId] || []).find((entry) => entry.id === Number(String(context.url).split('/').pop()))
    return item ? success(clone(item)) : fail('地址不存在', 404)
  },
  'address.create': async (context) => {
    const userId = assertAuthed(context)
    const payload = context.data as Address
    const bucket = state.addressesByUserId[userId] || (state.addressesByUserId[userId] = [])
    const item: Address = { ...payload, id: nextId(bucket), isDefault: Boolean(payload.isDefault) }
    if (item.isDefault) bucket.forEach((entry) => { entry.isDefault = false })
    bucket.push(item)
    return success(clone(item))
  },
  'address.update': async (context) => {
    const userId = assertAuthed(context)
    const id = Number(String(context.url).split('/').pop())
    const item = (state.addressesByUserId[userId] || []).find((entry) => entry.id === id)
    if (!item) return fail('地址不存在', 404)
    Object.assign(item, context.data as Address, { id })
    if (item.isDefault) {
      ;(state.addressesByUserId[userId] || []).forEach((entry) => {
        if (entry.id !== id) entry.isDefault = false
      })
    }
    return success(clone(item))
  },
  'address.delete': async (context) => {
    const userId = assertAuthed(context)
    const id = Number(String(context.url).split('/').pop())
    state.addressesByUserId[userId] = (state.addressesByUserId[userId] || []).filter((entry) => entry.id !== id)
    return success(null)
  },
  'address.default': async (context) => {
    const userId = assertAuthed(context)
    const id = Number(String(context.url).split('/').slice(-2)[0])
    ;(state.addressesByUserId[userId] || []).forEach((entry) => { entry.isDefault = entry.id === id })
    return success(null)
  },
  'order.preview.product': async (context) => {
    const product = getProductById(Number(String(context.url).split('/').pop()))
    if (!product) return fail('商品不存在', 404)
    const quantity = Number(context.params?.quantity || 1)
    const item: OrderItem = { id: Date.now(), productId: product.id, productName: product.name, productImage: product.coverImage, productPrice: product.price, quantity, totalPrice: toNumber(product.price) * quantity, productOrigin: product.origin }
    return success(item)
  },
  'order.preview.cart': async (context) => {
    const userId = assertAuthed(context)
    const ids = ((context.data as { itemIds?: number[] })?.itemIds || []).map((item) => Number(item))
    const records = (state.cartByUserId[userId] || []).filter((item) => ids.includes(item.id)).map<OrderItem>((item) => ({ id: item.id, productId: item.productId, productName: item.productName || '', productImage: item.productImage, productPrice: item.productPrice, quantity: item.quantity, totalPrice: item.totalPrice }))
    return success(clone(records))
  },
  'order.page': async (context) => {
    const userId = assertAuthed(context)
    const current = Number(context.params?.pageNum || 1)
    const size = Number(context.params?.pageSize || 10)
    const orderStatus = context.params?.orderStatus ? Number(context.params.orderStatus) : null
    let records = (state.ordersByUserId[userId] || []).slice()
    if (orderStatus) records = records.filter((item) => item.orderStatus === orderStatus)
    records.sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
    return success(createPage(clone(records), current, size))
  },
  'order.byId': async (context) => {
    const userId = assertAuthed(context)
    const item = (state.ordersByUserId[userId] || []).find((entry) => entry.id === Number(String(context.url).split('/').pop()))
    return item ? success(clone(item)) : fail('订单不存在', 404)
  },
  'order.byOrderNo': async (context) => {
    const userId = assertAuthed(context)
    const item = (state.ordersByUserId[userId] || []).find((entry) => entry.orderNo === String(context.url).split('/').pop())
    return item ? success(clone(item)) : fail('订单不存在', 404)
  },
  'order.create': async (context) => {
    const userId = assertAuthed(context)
    const payload = context.data as Partial<Order>
    const bucket = state.ordersByUserId[userId] || (state.ordersByUserId[userId] = [])
    const id = nextId(bucket)
    const order: Order = { id, orderNo: `TY${new Date().getFullYear()}${String(id).padStart(6, '0')}`, orderStatus: 1, paymentStatus: 0, createdAt: now(), totalAmount: payload.totalAmount || 0, actualAmount: payload.actualAmount || payload.totalAmount || 0, discountAmount: payload.discountAmount || 0, deliveryAddress: payload.deliveryAddress, deliveryName: payload.deliveryName, deliveryPhone: payload.deliveryPhone, paymentMethod: payload.paymentMethod, remark: payload.remark, orderItems: clone(payload.orderItems || []) }
    bucket.unshift(order)
    return success(clone(order))
  },
  'order.createFromCart': async (context) => {
    const userId = assertAuthed(context)
    const payload = context.data as { productIds?: number[] }
    const cart = state.cartByUserId[userId] || []
    const orderItems = cart.filter((item) => (payload.productIds || []).includes(item.productId)).map<OrderItem>((item) => ({ id: item.id, productId: item.productId, productName: item.productName || '', productImage: item.productImage, productPrice: item.productPrice, quantity: item.quantity, totalPrice: item.totalPrice }))
    const response = await handlers['order.create']({ ...context, data: { ...(context.data as object), orderItems } })
    state.cartByUserId[userId] = cart.filter((item) => !(payload.productIds || []).includes(item.productId))
    return response
  },
  'order.cancel': async (context) => {
    const userId = assertAuthed(context)
    const item = (state.ordersByUserId[userId] || []).find((entry) => entry.id === Number(String(context.url).split('/').slice(-2)[0]))
    if (!item) return fail('订单不存在', 404)
    item.orderStatus = 5
    return success(clone(item))
  },
  'order.confirm': async (context) => {
    const userId = assertAuthed(context)
    const item = (state.ordersByUserId[userId] || []).find((entry) => entry.id === Number(String(context.url).split('/').slice(-2)[0]))
    if (!item) return fail('订单不存在', 404)
    item.orderStatus = 4
    return success(clone(item))
  },
  'order.pay': async (context) => {
    const userId = assertAuthed(context)
    const orderNo = String((context.data as { orderNo?: string })?.orderNo || '')
    const item = (state.ordersByUserId[userId] || []).find((entry) => entry.orderNo === orderNo)
    if (!item) return fail('订单不存在', 404)
    item.paymentStatus = 1
    item.orderStatus = 2
    return success(true)
  },
  'forum.page': async (context) => {
    const current = Number(context.params?.pageNum || 1)
    const size = Number(context.params?.pageSize || 10)
    const category = String(context.params?.category || '')
    const keyword = String(context.params?.keyword || '').trim().toLowerCase()
    const sortField = String(context.params?.sortField || 'created_at')
    const sortOrder = String(context.params?.sortOrder || 'desc')
    let records = decorateForumPosts(context).filter((item) => item.status === 1 || item.userId === getCurrentUserId(context))
    if (category) records = records.filter((item) => item.category === category)
    if (keyword) records = records.filter((item) => item.title.toLowerCase().includes(keyword) || item.content.toLowerCase().includes(keyword))
    const fieldMap: Record<string, keyof ForumPost> = { created_at: 'createdAt', view_count: 'viewCount', like_count: 'likeCount', comment_count: 'commentCount' }
    const targetField = fieldMap[sortField] || 'createdAt'
    records.sort((left, right) => {
      const leftValue = typeof left[targetField] === 'string' ? new Date(left[targetField] as string).getTime() : toNumber(left[targetField] as number | string | undefined)
      const rightValue = typeof right[targetField] === 'string' ? new Date(right[targetField] as string).getTime() : toNumber(right[targetField] as number | string | undefined)
      return sortOrder === 'asc' ? leftValue - rightValue : rightValue - leftValue
    })
    return success(createPage(clone(records), current, size))
  },
  'forum.byId': async (context) => {
    const id = Number(String(context.url).split('/').pop())
    const item = state.forumPosts.find((entry) => entry.id === id)
    if (!item) return fail('帖子不存在', 404)
    item.viewCount = toNumber(item.viewCount) + 1
    const likedIds = getCurrentUserId(context) ? state.likedPostIds[getCurrentUserId(context) as number] || [] : []
    return success(clone({ ...item, categoryDesc: item.categoryDesc || forumCategoryText(item.category), isLiked: likedIds.includes(item.id) }))
  },
  'forum.create': async (context) => {
    const userId = assertAuthed(context)
    const payload = context.data as ForumPost
    const user = state.users.find((item) => item.id === userId)
    const post: ForumPost = { id: nextId(state.forumPosts), title: payload.title, content: payload.content, category: payload.category, categoryDesc: forumCategoryText(payload.category), images: payload.images, userId, status: 0, isTop: false, isFeatured: false, viewCount: 0, likeCount: 0, commentCount: 0, username: user?.username, realName: user?.realName, userAvatar: user?.avatar, createdAt: now(), isLiked: false }
    state.forumPosts.unshift(post)
    return success(post.id)
  },
  'forum.like': async (context) => {
    const userId = assertAuthed(context)
    const id = Number(String(context.url).split('/').slice(-2)[0])
    const post = state.forumPosts.find((item) => item.id === id)
    if (!post) return fail('帖子不存在', 404)
    const liked = state.likedPostIds[userId] || (state.likedPostIds[userId] = [])
    if (liked.includes(id)) {
      state.likedPostIds[userId] = liked.filter((item) => item !== id)
      post.likeCount = Math.max(0, toNumber(post.likeCount) - 1)
      return success(false)
    }
    liked.push(id)
    post.likeCount = toNumber(post.likeCount) + 1
    return success(true)
  },
  'forum.comments.page': async (context) => success(createPage(clone(getForumComments(context, Number(context.params?.postId || 0))), Number(context.params?.current || context.params?.pageNum || 1), Number(context.params?.size || context.params?.pageSize || 10))),
  'forum.comments.byPostId': async (context) => success(clone(getForumComments(context, Number(String(context.url).split('/').pop())))),
  'forum.comments.create': async (context) => {
    const userId = assertAuthed(context)
    const payload = context.data as ForumComment
    const user = state.users.find((item) => item.id === userId)
    const comment: ForumComment = { id: nextId(state.forumComments), postId: payload.postId, parentId: payload.parentId ?? null, content: payload.content, likeCount: 0, status: 1, username: user?.username, realName: user?.realName, userAvatar: user?.avatar, createdAt: now(), isLiked: false }
    state.forumComments.push(comment)
    const post = state.forumPosts.find((item) => item.id === payload.postId)
    if (post) post.commentCount = toNumber(post.commentCount) + 1
    return success(comment.id)
  },
  'forum.comments.like': async (context) => {
    const userId = assertAuthed(context)
    const id = Number(String(context.url).split('/').slice(-2)[0])
    const comment = state.forumComments.find((item) => item.id === id)
    if (!comment) return fail('评论不存在', 404)
    const liked = state.likedCommentIds[userId] || (state.likedCommentIds[userId] = [])
    if (liked.includes(id)) {
      state.likedCommentIds[userId] = liked.filter((item) => item !== id)
      comment.likeCount = Math.max(0, toNumber(comment.likeCount) - 1)
      return success(false)
    }
    liked.push(id)
    comment.likeCount = toNumber(comment.likeCount) + 1
    return success(true)
  },
  'review.create': async (context) => {
    const userId = assertAuthed(context)
    const payload = context.data as ProductReview
    const user = state.users.find((item) => item.id === userId)
    const review: ProductReview = { id: nextId(state.reviews), productId: payload.productId, orderId: payload.orderId, rating: payload.rating, content: payload.content, images: payload.images, isAnonymous: payload.isAnonymous, helpfulCount: 0, createdAt: now(), username: user?.username, realName: user?.realName, userAvatar: user?.avatar, isHelpful: false }
    state.reviews.unshift(review)
    recalcProductReviews(payload.productId)
    return success(clone(review))
  },
  'review.helpful': async (context) => {
    const userId = assertAuthed(context)
    const id = Number(String(context.url).split('/').slice(-2)[0])
    const review = state.reviews.find((item) => item.id === id)
    if (!review) return fail('评价不存在', 404)
    const helpful = state.helpfulReviewIds[userId] || (state.helpfulReviewIds[userId] = [])
    if (helpful.includes(id)) {
      state.helpfulReviewIds[userId] = helpful.filter((item) => item !== id)
      review.helpfulCount = Math.max(0, toNumber(review.helpfulCount) - 1)
      return success({ isHelpful: false })
    }
    helpful.push(id)
    review.helpfulCount = toNumber(review.helpfulCount) + 1
    return success({ isHelpful: true })
  },
  'ai.chat': async (context) => {
    const raw = typeof context.data === 'string' ? context.data : JSON.stringify(context.data || '')
    const content = raw.replace(/^"+|"+$/g, '')
    const lower = content.toLowerCase()
    let moduleType: AiChatResponse['moduleType'] = 'AUTO'
    let cards: AiCard[] = []
    let recommendText = '我先帮你整理了一批适合继续探索的内容。'
    if (lower.includes('特产') || lower.includes('买') || lower.includes('好物')) {
      moduleType = 'PRODUCT'
      cards = state.products.slice(0, 3).map((item) => ({ id: item.id, title: item.name, content: item.description || '', images: item.coverImage, detailUrl: `/pages/product/detail?id=${item.id}`, extra: `价格：${item.price}元，产地：${item.origin}，评分：${item.rating}分` }))
      recommendText = '如果你想带点桃源味道回家，可以先从这几样在地好物开始看。'
    } else if (lower.includes('资讯') || lower.includes('新闻') || lower.includes('动态')) {
      moduleType = 'NEWS'
      cards = state.news.slice(0, 3).map((item) => ({ id: item.id, title: item.title, content: item.summary || '', images: item.coverImage, detailUrl: `/pages/news/detail?id=${item.id}` }))
      recommendText = '我把最近值得先看的资讯整理好了。'
    } else if (lower.includes('建议') || lower.includes('共建') || lower.includes('社区')) {
      moduleType = 'ADVICE'
      cards = state.forumPosts.slice(0, 3).map((item) => ({ id: item.id, title: item.title, content: item.content, images: item.images, detailUrl: `/pages-forum/detail?id=${item.id}` }))
      recommendText = '这些是社区里热度较高的建言话题。'
    } else {
      moduleType = 'SCENIC'
      cards = state.attractions.slice(0, 3).map((item) => ({ id: item.id, title: item.name, content: item.description || '', images: item.coverImage, detailUrl: `/pages/attraction/detail?id=${item.id}`, extra: `评分：${item.rating}分，地址：${item.address}` }))
      recommendText = '如果你是第一次来桃源，我建议先从这几处风景开始。'
    }
    return success({ sessionId: `mock-session-${Date.now()}`, userId: getCurrentUserId(context) || 0, recommendText, moduleType, cardList: cards })
  },
}

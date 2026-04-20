import { STORAGE_KEYS } from '@/config/storage'
import type {
  Address,
  Attraction,
  CategoryItem,
  ForumComment,
  ForumPost,
  HomeData,
  NewsItem,
  Order,
  Product,
  ProductReview,
  ReviewStats,
  ShoppingCartItem,
  UserSession,
  VillageOverview,
} from '@/types/models'
import type { MockRequestContext, PageResult } from '@/types/api'
import { forumCategoryText, toNumber } from '@/utils/format'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

export const scenicCategoryList: CategoryItem[] = [
  { id: 1, name: '山水漫游' },
  { id: 2, name: '人文古镇' },
  { id: 3, name: '亲子休闲' },
]

export const productCategoryList: CategoryItem[] = [
  { id: 1, name: '农家风味' },
  { id: 2, name: '手作好礼' },
  { id: 3, name: '山野鲜货' },
]

export const attractionSeed: Attraction[] = [
  { id: 1, name: '桃花源风景区', categoryId: 1, categoryName: '山水漫游', description: '山水与溪谷交织的桃源经典线路。', coverImage: '/static/images/hero-scenic.jpg', images: ['/static/images/hero-scenic.jpg', '/static/images/overview.jpg'], address: '湖南省 常德市 桃源县 桃花源镇', trafficGuide: '建议导航至游客中心。', openingHours: '08:30-17:30', ticketPrice: 68, rating: 4.8, viewCount: 4890, status: 1 },
  { id: 2, name: '秦谷古村', categoryId: 2, categoryName: '人文古镇', description: '适合慢逛、看院落、感受乡村烟火。', coverImage: '/static/images/overview.jpg', images: ['/static/images/overview.jpg'], address: '湖南省 常德市 桃源县 秦谷村', trafficGuide: '适合自驾抵达。', openingHours: '全天开放', ticketPrice: 0, rating: 4.5, viewCount: 2760, status: 1 },
  { id: 3, name: '五柳湖湿地', categoryId: 3, categoryName: '亲子休闲', description: '轻徒步和湖边休闲都很舒服。', coverImage: '/static/images/hero-scenic.jpg', images: ['/static/images/hero-scenic.jpg'], address: '湖南省 常德市 桃源县 五柳湖', trafficGuide: '可骑行或自驾前往。', openingHours: '09:00-18:00', ticketPrice: 20, rating: 4.6, viewCount: 1920, status: 1 },
]

export const productSeed: Product[] = [
  { id: 101, name: '桃源蜂蜜礼盒', categoryId: 1, categoryName: '农家风味', subtitle: '山花蜜香，适合作为伴手礼', description: '采自桃源山花林地，花香清润。', content: '<p>适合泡水、涂抹和烘焙。</p>', features: '山花蜜源,低温灌装,礼盒包装', coverImage: '/static/images/hero-product.jpg', images: ['/static/images/hero-product.jpg', '/static/images/overview.jpg'], price: 79, originalPrice: 99, stock: 88, salesCount: 236, origin: '桃源县漆河镇', rating: 4.8, reviewCount: 12, isFeatured: true, isHot: true, specifications: '500g/盒,2盒装' },
  { id: 102, name: '桃源米酒', categoryId: 1, categoryName: '农家风味', subtitle: '糯香柔和，适合暖饮', description: '传统工艺酿制，口感清甜。', content: '<p>适合家庭分享。</p>', features: '糯米酿造,低度清甜', coverImage: '/static/images/hero-product.jpg', images: ['/static/images/hero-product.jpg'], price: 46, originalPrice: 58, stock: 96, salesCount: 188, origin: '桃源县热市镇', rating: 4.7, reviewCount: 9, isHot: true, specifications: '500ml/瓶' },
  { id: 103, name: '手工竹编果篮', categoryId: 2, categoryName: '手作好礼', subtitle: '轻巧耐用，带有手作温度', description: '适合收纳或作为礼品摆件。', coverImage: '/static/images/hero-product.jpg', images: ['/static/images/hero-product.jpg'], price: 68, stock: 32, salesCount: 54, origin: '桃源县夷望溪镇', rating: 4.6, reviewCount: 4, specifications: '中号 / 直径 28cm' },
  { id: 104, name: '山野干菌组合', categoryId: 3, categoryName: '山野鲜货', subtitle: '煲汤、炒菜都很出味', description: '精选山野干菌组合。', coverImage: '/static/images/hero-product.jpg', images: ['/static/images/hero-product.jpg'], price: 59, stock: 64, salesCount: 73, origin: '桃源县茶庵铺镇', rating: 4.5, reviewCount: 6, specifications: '300g/袋' },
]

export const newsSeed: NewsItem[] = [
  { id: 201, title: '桃源春季文旅线路上新', summary: '山水与古村串联成一条轻旅行路线。', content: '<p>主打“山水桃源一日游”。</p>', coverImage: '/static/images/hero-news.jpg', category: 'activity', categoryDesc: '活动预告', author: '文旅中心', publishTime: '2026-04-12T08:00:00', createdAt: '2026-04-12T08:00:00', isTop: true },
  { id: 202, title: '桃源县启动特色农产品牌升级行动', summary: '围绕蜂蜜、米酒、竹编推进统一包装与数字销售。', content: '<p>升级将覆盖视觉包装和线上销售。</p>', coverImage: '/static/images/hero-news.jpg', category: 'news', categoryDesc: '乡村新闻', author: '融媒体中心', publishTime: '2026-04-10T09:30:00', createdAt: '2026-04-10T09:30:00' },
  { id: 203, title: '清明假期文明游园倡议发布', summary: '倡导绿色出行、文明游览。', content: '<p>请合理安排出行时间。</p>', coverImage: '/static/images/hero-news.jpg', category: 'policy', categoryDesc: '政策通知', author: '景区管理处', publishTime: '2026-04-08T10:00:00', createdAt: '2026-04-08T10:00:00' },
  { id: 204, title: '周末乡村集市新增夜场试营业', summary: '夜场集市将引入轻食和手作快闪。', content: '<p>围绕周五和周六晚间开放。</p>', coverImage: '/static/images/hero-news.jpg', category: 'activity', categoryDesc: '活动预告', author: '集市运营组', publishTime: '2026-04-05T19:00:00', createdAt: '2026-04-05T19:00:00' },
]

export const defaultUser: UserSession = {
  token: 'mock-token-1',
  id: 1,
  username: 'taoyuan_demo',
  realName: '桃源体验官',
  email: 'demo@taoyuan.cn',
  phoneNumber: '13800138000',
  role: 'USER',
  avatar: '/static/images/mascot.png',
  createdAt: '2026-01-12T10:00:00',
}

export type RuntimeUser = UserSession & { password: string }

export const orderSeed: Order[] = [
  { id: 301, orderNo: 'TY202604170001', orderStatus: 1, paymentStatus: 0, createdAt: '2026-04-17T09:18:00', totalAmount: 158, actualAmount: 158, deliveryAddress: '湖南省 常德市 桃源县 漆河镇 智界路 18 号', deliveryName: '桃源体验官', deliveryPhone: '13800138000', paymentMethod: 'wechat', remark: '', orderItems: [{ id: 1, productId: 101, productName: '桃源蜂蜜礼盒', productImage: '/static/images/hero-product.jpg', productPrice: 79, quantity: 2, totalPrice: 158 }] },
  { id: 302, orderNo: 'TY202604150002', orderStatus: 3, paymentStatus: 1, createdAt: '2026-04-15T14:10:00', totalAmount: 46, actualAmount: 46, deliveryAddress: '湖南省 常德市 桃源县 漆河镇 智界路 18 号', deliveryName: '桃源体验官', deliveryPhone: '13800138000', paymentMethod: 'alipay', orderItems: [{ id: 2, productId: 102, productName: '桃源米酒', productImage: '/static/images/hero-product.jpg', productPrice: 46, quantity: 1, totalPrice: 46 }] },
  { id: 303, orderNo: 'TY202604120003', orderStatus: 4, paymentStatus: 1, createdAt: '2026-04-12T11:00:00', totalAmount: 68, actualAmount: 68, deliveryAddress: '湖南省 常德市 桃源县 漆河镇 智界路 18 号', deliveryName: '桃源体验官', deliveryPhone: '13800138000', paymentMethod: 'wechat', orderItems: [{ id: 3, productId: 103, productName: '手工竹编果篮', productImage: '/static/images/hero-product.jpg', productPrice: 68, quantity: 1, totalPrice: 68 }] },
]

export const reviewSeed: ProductReview[] = [
  { id: 401, productId: 101, orderId: 303, rating: 5, content: '包装很体面，蜂蜜香气也很干净。', images: ['/static/images/hero-product.jpg'], isAnonymous: false, helpfulCount: 3, createdAt: '2026-04-13T16:10:00', username: '桃源体验官', userAvatar: '/static/images/mascot.png', isHelpful: false },
  { id: 402, productId: 102, rating: 4, content: '入口偏柔和，热一热更好喝。', isAnonymous: true, helpfulCount: 1, createdAt: '2026-04-14T18:20:00', username: '小溪', userAvatar: '/static/images/mascot.png', isHelpful: false },
]

export const forumPostSeed: ForumPost[] = [
  { id: 501, title: '建议增加景区到集市的联动接驳车', content: '建议周末试行循环接驳。', category: 'tourism', categoryDesc: '旅游发展', images: ['/static/images/overview.jpg'], status: 1, isTop: true, isFeatured: true, viewCount: 206, likeCount: 18, commentCount: 3, username: '桃源体验官', realName: '桃源体验官', userAvatar: '/static/images/mascot.png', createdAt: '2026-04-11T09:00:00', isLiked: false },
  { id: 502, title: '古村导览牌建议增加双语说明', content: '希望导览牌能增加更直观的信息层级。', category: 'education', categoryDesc: '教育文化', status: 1, isTop: false, isFeatured: true, viewCount: 132, likeCount: 9, commentCount: 1, username: '五柳散人', realName: '五柳散人', userAvatar: '/static/images/mascot.png', createdAt: '2026-04-10T10:30:00', isLiked: false },
  { id: 503, title: '建议在乡村集市增加休息区和饮水点', content: '建议适度增加遮阳和饮水设施。', category: 'infrastructure', categoryDesc: '基础设施', status: 1, isTop: false, isFeatured: false, viewCount: 88, likeCount: 6, commentCount: 2, username: '桃李', realName: '桃李', userAvatar: '/static/images/mascot.png', createdAt: '2026-04-09T13:20:00', isLiked: false },
]

export const forumCommentSeed: ForumComment[] = [
  { id: 601, postId: 501, parentId: null, content: '这个建议很实用。', likeCount: 3, status: 1, username: '青溪', realName: '青溪', userAvatar: '/static/images/mascot.png', createdAt: '2026-04-11T10:00:00', isLiked: false },
  { id: 602, postId: 501, parentId: 601, content: '如果结合集市营业时段会更合理。', likeCount: 1, status: 1, username: '山居', realName: '山居', userAvatar: '/static/images/mascot.png', createdAt: '2026-04-11T10:20:00', isLiked: false },
  { id: 603, postId: 503, parentId: null, content: '建议同时补几处母婴友好休息点。', likeCount: 0, status: 1, username: '路人甲', realName: '路人甲', userAvatar: '/static/images/mascot.png', createdAt: '2026-04-09T14:20:00', isLiked: false },
]

export const addressSeed: Address[] = [
  { id: 701, receiverName: '桃源体验官', receiverPhone: '13800138000', province: '湖南省', city: '常德市', district: '桃源县', detailAddress: '漆河镇智界路 18 号', isDefault: true },
  { id: 702, receiverName: '桃源体验官', receiverPhone: '13800138000', province: '湖南省', city: '常德市', district: '桃源县', detailAddress: '桃花源镇游客服务中心旁', isDefault: false },
]

export interface MockRuntimeState {
  users: RuntimeUser[]
  attractions: Attraction[]
  products: Product[]
  news: NewsItem[]
  forumPosts: ForumPost[]
  forumComments: ForumComment[]
  addressesByUserId: Record<number, Address[]>
  cartByUserId: Record<number, ShoppingCartItem[]>
  ordersByUserId: Record<number, Order[]>
  reviews: ProductReview[]
  likedPostIds: Record<number, number[]>
  likedCommentIds: Record<number, number[]>
  helpfulReviewIds: Record<number, number[]>
}

export const state: MockRuntimeState = {
  users: [{ ...defaultUser, password: '123456' }],
  attractions: clone(attractionSeed),
  products: clone(productSeed),
  news: clone(newsSeed),
  forumPosts: clone(forumPostSeed),
  forumComments: clone(forumCommentSeed),
  addressesByUserId: { 1: clone(addressSeed) },
  cartByUserId: { 1: [{ id: 801, productId: 101, quantity: 1, productName: '桃源蜂蜜礼盒', productImage: '/static/images/hero-product.jpg', productPrice: 79, productStock: 88, totalPrice: 79, selected: true }] },
  ordersByUserId: { 1: clone(orderSeed) },
  reviews: clone(reviewSeed),
  likedPostIds: { 1: [] },
  likedCommentIds: { 1: [] },
  helpfulReviewIds: { 1: [] },
}

export const overviewData: VillageOverview = {
  title: '新桃源智界',
  subtitle: '把景点、特产、资讯与共建入口装进一张掌心门户。',
  description: '从山水桃源到在地集市，再到社区共建，这里把乡村的风景、生活与新变化串成一条清晰体验线。',
  honors: ['山水文旅', '在地好物', '共建社区'],
  attractionCount: state.attractions.length,
  productCount: state.products.length,
  newsCount: state.news.length,
  image: '/static/images/overview.jpg',
}

export const getCurrentSession = () => {
  const session = uni.getStorageSync(STORAGE_KEYS.session) as UserSession | undefined
  return session || null
}

export const getCurrentUserId = (context: MockRequestContext) => {
  const session = getCurrentSession()
  if (session?.id) return session.id
  if (context.token.startsWith('mock-token-')) {
    const id = Number(context.token.replace('mock-token-', ''))
    return Number.isFinite(id) ? id : null
  }
  return null
}

export const assertAuthed = (context: MockRequestContext) => {
  const userId = getCurrentUserId(context)
  if (!userId) throw new Error('请先登录')
  return userId
}

export const nextId = (records: Array<{ id: number | null }>) => {
  const ids = records.map((item) => item.id).filter((item): item is number => typeof item === 'number')
  return ids.length ? Math.max(...ids) + 1 : 1
}
export const getProductById = (productId: number) => state.products.find((item) => item.id === productId) || null
export const createPage = <T>(records: T[], current = 1, size = 10): PageResult<T> => ({ records: records.slice((current - 1) * size, (current - 1) * size + size), total: records.length, current, size })

export const toCartItem = (product: Product, quantity = 1, id = Date.now()): ShoppingCartItem => ({
  id,
  productId: product.id,
  quantity,
  productName: product.name,
  productImage: product.coverImage,
  productPrice: product.price,
  productStock: product.stock,
  productUnit: product.unit,
  totalPrice: toNumber(product.price) * quantity,
  selected: true,
})

export const recalcProductReviews = (productId: number) => {
  const product = getProductById(productId)
  if (!product) return
  const reviews = state.reviews.filter((item) => item.productId === productId)
  const total = reviews.length
  const avg = total ? reviews.reduce((sum, item) => sum + toNumber(item.rating), 0) / total : 0
  product.reviewCount = total
  product.rating = total ? Number(avg.toFixed(1)) : 0
}

export const getHomeData = (): HomeData => ({
  recommendAttractions: clone(state.attractions.slice(0, 3)),
  hotAttractions: clone(state.attractions.slice(0, 3)),
  attractionCategories: clone(scenicCategoryList),
  featuredProducts: clone(state.products.filter((item) => item.isFeatured).slice(0, 4)),
  hotProducts: clone(state.products.slice(0, 4)),
  productCategories: clone(productCategoryList),
  topNews: clone(state.news.filter((item) => item.isTop).slice(0, 3)),
  featuredNews: clone(state.news.slice(0, 4)),
  latestNews: clone(state.news.slice(0, 4)),
  latestPolicies: clone(state.news.filter((item) => item.category === 'policy').slice(0, 3)),
  latestActivities: clone(state.news.filter((item) => item.category === 'activity').slice(0, 3)),
  topPosts: clone(state.forumPosts.filter((item) => item.status === 1).slice(0, 3)),
})

export const getReviewStatsForProduct = (productId: number): ReviewStats => {
  const reviews = state.reviews.filter((item) => item.productId === productId)
  const totalCount = reviews.length
  const avg = totalCount ? reviews.reduce((sum, item) => sum + toNumber(item.rating), 0) / totalCount : 0
  return {
    avg_rating: Number(avg.toFixed(1)),
    total_count: totalCount,
    has_images_count: reviews.filter((item) => Boolean(item.images)).length,
    rating_1_count: reviews.filter((item) => item.rating === 1).length,
    rating_2_count: reviews.filter((item) => item.rating === 2).length,
    rating_3_count: reviews.filter((item) => item.rating === 3).length,
    rating_4_count: reviews.filter((item) => item.rating === 4).length,
    rating_5_count: reviews.filter((item) => item.rating === 5).length,
  }
}

export const getReviewDistribution = (productId: number) => {
  const stats = getReviewStatsForProduct(productId)
  return [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: toNumber(stats[`rating_${rating}_count` as keyof ReviewStats] as number | undefined),
  }))
}

export const getForumComments = (context: MockRequestContext, postId: number) => {
  const userId = getCurrentUserId(context)
  const likedIds = userId ? state.likedCommentIds[userId] || [] : []
  const flat: ForumComment[] = state.forumComments
    .filter((item) => item.postId === postId && item.status === 1)
    .map((item) => ({ ...item, isLiked: likedIds.includes(item.id), replies: [] }))
  const topLevel: ForumComment[] = flat.filter((item) => !item.parentId)
  topLevel.forEach((comment) => {
    comment.replies = flat.filter((item) => item.parentId === comment.id)
  })
  return topLevel
}

export const decorateForumPosts = (context: MockRequestContext) => {
  const userId = getCurrentUserId(context)
  const likedIds = userId ? state.likedPostIds[userId] || [] : []
  return state.forumPosts.map((item) => ({
    ...item,
    categoryDesc: item.categoryDesc || forumCategoryText(item.category),
    isLiked: likedIds.includes(item.id),
  }))
}

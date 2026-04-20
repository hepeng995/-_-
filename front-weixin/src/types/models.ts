import type { PageResult } from './api'

export interface AppConfig {
  apiBaseUrl: string
  assetBaseUrl: string
  enableCart: boolean
  enableAI: boolean
  enableMockFallback: boolean
  enableMockAuth: boolean
  enableMockPayment: boolean
  mockLatency: number
  appName: string
  versionName: string
}

export interface UserSession {
  token: string
  id: number | null
  username: string
  avatar?: string
  role?: string
  realName?: string
  email?: string
  phoneNumber?: string
  enabled?: boolean
  createdAt?: string
}

export interface PostLoginRedirect {
  path: string
  query?: Record<string, string>
  isTab?: boolean
}

export interface CategoryItem {
  id: number
  name: string
  description?: string
  status?: number
}

export interface ChipOption {
  label: string
  value: string | number | null
  badge?: string | number
}

export interface Attraction {
  id: number
  name: string
  categoryId?: number
  categoryName?: string
  description?: string
  coverImage?: string
  images?: string | string[]
  panoramaUrl?: string
  longitude?: number | string
  latitude?: number | string
  address?: string
  trafficGuide?: string
  openingHours?: string
  ticketPrice?: number | string
  rating?: number | string
  viewCount?: number
  features?: string[] | string
  status?: number
}

export interface Product {
  id: number
  name: string
  categoryId?: number
  categoryName?: string
  description?: string
  coverImage?: string
  images?: string | string[]
  price?: number | string
  originalPrice?: number | string
  stock?: number
  salesCount?: number
  unit?: string
  origin?: string
  subtitle?: string
  content?: string
  features?: string
  shelfLife?: string
  rating?: number | string
  reviewCount?: number
  isFeatured?: boolean
  isNew?: boolean
  isHot?: boolean
  specifications?: string
  buyQuantity?: number
}

export interface NewsItem {
  id: number
  title: string
  summary?: string
  content?: string
  coverImage?: string
  category?: string
  categoryDesc?: string
  author?: string
  source?: string
  viewCount?: number
  isTop?: boolean
  isFeatured?: boolean
  publishTime?: string
  createdAt?: string
}

export interface ShoppingCartItem {
  id: number
  productId: number
  quantity: number
  productName?: string
  productImage?: string
  productPrice?: number | string
  productStock?: number
  productUnit?: string
  totalPrice?: number | string
  selected?: boolean
}

export interface CartState {
  count: number
  items: ShoppingCartItem[]
  loading: boolean
}

export interface VillageOverview {
  title?: string
  subtitle?: string
  description?: string
  honors?: string[] | string
  features?: string[]
  attractionCount?: number
  productCount?: number
  newsCount?: number
  image?: string
}

export interface HomeData {
  recommendAttractions: Attraction[]
  hotAttractions: Attraction[]
  attractionCategories: CategoryItem[]
  featuredProducts: Product[]
  hotProducts: Product[]
  productCategories: CategoryItem[]
  topNews: NewsItem[]
  featuredNews: NewsItem[]
  latestNews: NewsItem[]
  latestPolicies: NewsItem[]
  latestActivities: NewsItem[]
  topPosts?: ForumPost[]
}

export interface Address {
  id: number
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  isDefault?: boolean
}

export interface OrderItem {
  id?: number
  productId: number
  productName: string
  productImage?: string
  productPrice?: number | string
  price?: number | string
  quantity: number
  totalPrice?: number | string
  specification?: string
  productOrigin?: string
  productUnit?: string
}

export interface Order {
  id: number
  orderNo: string
  orderStatus: number
  paymentStatus?: number
  createdAt?: string
  updatedAt?: string
  totalAmount?: number | string
  actualAmount?: number | string
  discountAmount?: number | string
  deliveryAddress?: string
  deliveryName?: string
  deliveryPhone?: string
  paymentMethod?: string
  remark?: string
  orderItems: OrderItem[]
}

export interface ForumPost {
  id: number
  title: string
  content: string
  category: string
  categoryDesc?: string
  images?: string | string[]
  userId?: number
  status?: number
  isTop?: boolean
  isFeatured?: boolean
  viewCount?: number
  likeCount?: number
  commentCount?: number
  adminReply?: string
  rejectReason?: string
  createdAt?: string
  updatedAt?: string
  username?: string
  realName?: string
  userAvatar?: string
  statusDesc?: string
  isLiked?: boolean
}

export interface ForumComment {
  id: number
  postId: number
  userId?: number
  parentId?: number | null
  content: string
  images?: string | string[]
  likeCount?: number
  status?: number
  createdAt?: string
  updatedAt?: string
  username?: string
  realName?: string
  userAvatar?: string
  statusDesc?: string
  isLiked?: boolean
  parentComment?: ForumComment | null
  replies?: ForumComment[]
}

export interface ProductReview {
  id: number
  productId: number
  userId?: number
  orderId?: number
  rating: number
  content?: string
  images?: string | string[]
  isAnonymous?: boolean
  status?: number
  replyContent?: string
  replyTime?: string
  helpfulCount?: number
  createdAt?: string
  updatedAt?: string
  username?: string
  realName?: string
  userAvatar?: string
  productName?: string
  productCoverImage?: string
  statusDesc?: string
  isHelpful?: boolean
}

export interface ReviewStats {
  avg_rating?: number
  total_count?: number
  has_images_count?: number
  rating_1_count?: number
  rating_2_count?: number
  rating_3_count?: number
  rating_4_count?: number
  rating_5_count?: number
}

export interface ReviewDistributionItem {
  rating: number
  count: number
}

export interface ProductReviewBundle {
  reviews: PageResult<ProductReview>
  stats: ReviewStats
  distribution: ReviewDistributionItem[]
}

export type AiModuleType = 'PRODUCT' | 'SCENIC' | 'NEWS' | 'ADVICE' | 'AUTO' | 'ERROR'

export interface AiCard {
  id: number | string
  title: string
  content: string
  images?: string | string[]
  detailUrl?: string
  extra?: string
}

export interface AiChatResponse {
  sessionId?: string
  userId?: number
  recommendText?: string
  moduleType?: AiModuleType
  cardList?: AiCard[]
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  loading?: boolean
  cards?: AiCard[]
  moduleType?: AiModuleType
  createdAt?: number
}

export type AttractionPage = PageResult<Attraction>
export type ProductPage = PageResult<Product>
export type NewsPage = PageResult<NewsItem>
export type ForumPostPage = PageResult<ForumPost>
export type ForumCommentPage = PageResult<ForumComment>
export type OrderPage = PageResult<Order>
export type ProductReviewPage = PageResult<ProductReview>

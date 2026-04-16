// ========== 通用 API 响应类型 ==========

/** 后端统一响应信封 Result<T> */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/** 分页查询结果 */
export interface PageResult<T> {
  records: T[];
  total: number;
}

/** 分页查询参数 */
export interface PageParams {
  current?: number;
  size?: number;
  [key: string]: any;
}

// ========== 用户相关 ==========

export interface User {
  id: number;
  username: string;
  realName: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  role: 'USER' | 'ADMIN' | 'STAFF';
  enabled: boolean;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  token: string;
  role: string;
  avatar: string;
  email: string;
  realName: string;
}

export interface UserStats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
  staffCount: number;
  enabledCount: number;
  disabledCount: number;
}

// ========== 景点相关 ==========

export interface Attraction {
  id: number;
  name: string;
  categoryId: number;
  categoryName?: string;
  description: string;
  coverImage: string;
  longitude: number;
  latitude: number;
  address: string;
  trafficGuide: string;
  openingHours: string;
  ticketPrice: number;
  status: number;
  createdAt: string;
  rating: number;
  viewCount: number;
}

export interface AttractionCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  createdAt?: string;
}

// ========== 商品相关 ==========

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  categoryName?: string;
  description: string;
  coverImage: string;
  price: number;
  originalPrice: number;
  stock: number;
  unit: string;
  weight?: string;
  specifications?: string;
  origin?: string;
  isFeatured: boolean;
  status: number;
  salesCount: number;
  rating: number;
  createdAt: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  description: string;
  icon?: string;
  sortOrder: number;
  status: number;
  createdAt?: string;
}

// ========== 订单相关 ==========

export interface Order {
  id: number;
  orderNo: string;
  totalAmount: number;
  actualAmount: number;
  discountAmount: number;
  deliveryName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: number;
  orderStatus: number;
  remark?: string;
  cancelReason?: string;
  createdAt: string;
  orderItems?: OrderItem[];
  username?: string;
  userId?: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingPayment: number;
  paid: number;
  shipped: number;
  completed: number;
  cancelled: number;
  refunded: number;
  totalAmount: number;
}

// ========== 新闻/资讯相关 ==========

export interface NewsItem {
  id: number;
  title: string;
  summary?: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  source?: string;
  isTop: boolean;
  isFeatured: boolean;
  publishTime?: string;
  status: number;
  viewCount: number;
  createdAt: string;
}

// ========== 论坛相关 ==========

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  category: string;
  images?: string;
  username: string;
  userId: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  status: number;
  isTop: boolean;
  isFeatured: boolean;
  rejectReason?: string;
  adminReply?: string;
  createdAt: string;
}

export interface ForumComment {
  id: number;
  content: string;
  postId: number;
  postTitle?: string;
  userId: number;
  username: string;
  likeCount: number;
  status: number;
  parentId?: number;
  images?: string;
  createdAt: string;
}

export interface ForumOverview {
  totalPosts: number;
  approvedPosts: number;
  pendingPosts: number;
  rejectedPosts: number;
  totalComments: number;
  activeUsers: number;
}

export interface ForumCategoryStat {
  name: string;
  value: number;
}

export interface ForumMonthlyTrend {
  month: string;
  posts: number;
  comments: number;
}

export interface ForumAuditStatus {
  pending: number;
  approved: number;
  rejected: number;
}

// ========== 系统配置相关 ==========

export interface SystemConfig {
  id: number;
  configName: string;
  configKey: string;
  configValue: string;
  configType: string;
  configOptions?: string;
  groupName: string;
  sort: number;
  remark?: string;
}

// ========== 系统日志相关 ==========

export interface SystemLog {
  id: number;
  username: string;
  module: string;
  operation: string;
  description: string;
  ipAddress: string;
  status: number;
  executionTime: number;
  requestMethod: string;
  requestUrl: string;
  requestParams?: string;
  errorMessage?: string;
  createdAt: string;
}

// ========== 文件上传 ==========

export interface UploadResult {
  url: string;
  filename: string;
  originalFilename: string;
}

// ========== 评价相关 ==========

export interface Review {
  id: number;
  productId: number;
  productName?: string;
  userId: number;
  username: string;
  orderNo?: string;
  rating: number;
  content: string;
  images?: string;
  status: number;
  reply?: string;
  replyTime?: string;
  helpfulCount: number;
  createdAt: string;
}

// ========== 首页/仪表盘相关 ==========

export interface HomeData {
  banners: any[];
  featuredAttractions: Attraction[];
  featuredProducts: Product[];
  latestNews: NewsItem[];
}

export interface HomeStats {
  attractionCount: number;
  productCount: number;
  orderCount: number;
  newsCount: number;
  userCount: number;
  forumPostCount: number;
  forumCommentCount: number;
}

export interface HomeOverview {
  totalAttractions: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  todayOrders: number;
  todayRevenue: number;
  todayVisits: number;
}

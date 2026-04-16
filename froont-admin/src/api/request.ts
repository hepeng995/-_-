import axios, { type AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types';

// 创建 axios 实例
const _instance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

// 请求拦截器：注入 JWT Token
_instance.interceptors.request.use(
  (config) => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：解包 AxiosResponse -> ApiResponse<T>
_instance.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 成功
    if (res.code === 200) {
      return res;
    }

    // 401 未登录或 token 过期
    if (res.code === 401) {
      console.error('未授权:', res.message);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userInfo');
      window.location.href = '/login';
      return Promise.reject(new Error(res.message || '未授权'));
    }

    // 403 权限不足
    if (res.code === 403) {
      console.error('权限不足:', res.message);
      return Promise.reject(new Error(res.message || '没有操作权限'));
    }

    // 其他错误
    console.error('API错误:', res.code, res.message);
    return Promise.reject(new Error(res.message || '操作失败'));
  },
  (error) => {
    console.error('响应错误:', error);

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('userInfo');
          window.location.href = '/login';
          break;
        case 403:
          console.error('权限不足:', data?.message);
          break;
        case 404:
          console.error('请求资源不存在');
          break;
        case 500:
          console.error('服务器内部错误:', data?.message);
          break;
        default:
          console.error(`请求失败: ${status}`);
      }
    } else if (error.request) {
      console.error('服务器未响应，请检查后端服务是否启动');
    }

    return Promise.reject(error);
  }
);

// 类型安全的请求封装
// 响应拦截器已将 AxiosResponse 解包为 ApiResponse<T>，
// 所以泛型参数 T 直接对应 data 字段的类型
const request = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return _instance.get(url, config) as unknown as Promise<ApiResponse<T>>;
  },
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return _instance.post(url, data, config) as unknown as Promise<ApiResponse<T>>;
  },
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return _instance.put(url, data, config) as unknown as Promise<ApiResponse<T>>;
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return _instance.delete(url, config) as unknown as Promise<ApiResponse<T>>;
  },
};

export default request;

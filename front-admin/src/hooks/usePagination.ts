import { useState, useEffect, useCallback } from 'react';
import type { PageParams, PageResult, ApiResponse } from '../types';

interface UsePaginationOptions<T, P extends PageParams> {
  fetchFn: (params: P) => Promise<ApiResponse<PageResult<T>>>;
  defaultPageSize?: number;
  defaultParams?: Partial<P>;
}

interface UsePaginationReturn<T, P = PageParams> {
  data: T[];
  total: number;
  loading: boolean;
  current: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => void;
  setFilters: (filters: Partial<P>) => void;
}

export function usePagination<T, P extends PageParams = PageParams>(
  options: UsePaginationOptions<T, P>
): UsePaginationReturn<T> {
  const { fetchFn, defaultPageSize = 10, defaultParams = {} as Partial<P> } = options;

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);
  const [filters, setFiltersState] = useState<Partial<P>>(defaultParams);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        current,
        size: pageSize,
        ...filters,
      } as P;
      const res = await fetchFn(params);
      if (res.code === 200 && res.data) {
        setData(res.data.records || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('分页查询失败:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, current, pageSize, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setCurrentPage = (page: number) => {
    setCurrent(page);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setCurrent(1);
  };

  const setFilters = (newFilters: Partial<P>) => {
    setFiltersState(newFilters);
    setCurrent(1);
  };

  return {
    data,
    total,
    loading,
    current,
    pageSize,
    setCurrentPage,
    setPageSize,
    refresh: fetchData,
    setFilters,
  };
}

export default usePagination;

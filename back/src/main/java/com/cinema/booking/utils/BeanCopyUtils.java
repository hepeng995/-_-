package com.cinema.booking.utils;

import org.springframework.beans.BeanUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

/**
 * Bean属性拷贝工具类
 */
public class BeanCopyUtils {

    /**
     * 复制对象属性
     *
     * @param source 源对象
     * @param target 目标类
     * @return 目标对象
     */
    public static <T> T copyProperties(Object source, Class<T> target) {
        if (source == null) {
            return null;
        }
        
        T result;
        try {
            result = target.getDeclaredConstructor().newInstance();
            BeanUtils.copyProperties(source, result);
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Bean属性复制失败", e);
        }
    }
    
    /**
     * 复制Bean属性 - copyBean方法的别名
     *
     * @param source 源对象
     * @param target 目标类
     * @return 目标对象
     */
    public static <T> T copyBean(Object source, Class<T> target) {
        return copyProperties(source, target);
    }

    /**
     * 复制集合对象属性
     *
     * @param sourceList 源对象集合
     * @param target     目标类
     * @return 目标对象集合
     */
    public static <S, T> List<T> copyListProperties(List<S> sourceList, Class<T> target) {
        if (sourceList == null || sourceList.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<T> targetList = new ArrayList<>(sourceList.size());
        for (S source : sourceList) {
            T targetObj = copyProperties(source, target);
            targetList.add(targetObj);
        }
        return targetList;
    }
    
    /**
     * 带有回调函数的集合复制
     *
     * @param sourceList 源对象集合
     * @param targetSupplier 目标对象供应商
     * @param callBack 回调函数
     * @return 目标对象集合
     */
    public static <S, T> List<T> copyListProperties(List<S> sourceList, Supplier<T> targetSupplier, BeanCopyCallback<S, T> callBack) {
        if (sourceList == null || sourceList.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<T> targetList = new ArrayList<>(sourceList.size());
        for (S source : sourceList) {
            T target = targetSupplier.get();
            BeanUtils.copyProperties(source, target);
            if (callBack != null) {
                callBack.callBack(source, target);
            }
            targetList.add(target);
        }
        return targetList;
    }
    
    /**
     * Bean拷贝回调接口
     */
    @FunctionalInterface
    public interface BeanCopyCallback<S, T> {
        /**
         * 回调方法
         *
         * @param source 源对象
         * @param target 目标对象
         */
        void callBack(S source, T target);
    }
} 
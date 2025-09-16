package com.cinema.booking.exception;

/**
 * 服务异常类
 */
public class ServiceException extends RuntimeException {
    
    private Integer code;
    
    public ServiceException(String message) {
        super(message);
        this.code = 500;
    }
    
    public ServiceException(String message, Throwable cause) {
        super(message, cause);
        this.code = 500;
    }
    
    public ServiceException(Integer code, String message) {
        super(message);
        this.code = code;
    }
    
    public ServiceException(Integer code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
    
    public Integer getCode() {
        return code;
    }
    
    public void setCode(Integer code) {
        this.code = code;
    }
} 
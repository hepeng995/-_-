package com.cinema.booking.controller;

import com.cinema.booking.dto.FileUploadResultDTO;
import com.cinema.booking.utils.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.HttpServletResponse;

/**
 * 文件上传下载控制器
 */
@Slf4j
@RestController
@RequestMapping("/file")
@CrossOrigin
public class FileController {

    @Value("${server.port:7070}")
    private String port;

    @Value("${file.upload.path:files}")
    private String uploadPath;

    /**
     * 上传文件
     * @param file 文件
     * @return 文件访问URL
     * @throws IOException IO异常
     */
    @PostMapping("/upload")
    public Result<FileUploadResultDTO> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return Result.fail("文件为空");
        }

        // 获取文件名和扩展名
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        
        // 使用UUID生成新文件名，避免文件名冲突
        String newFileName = UUID.randomUUID().toString() + fileExtension;
        
        // 确保上传目录存在
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists() && !uploadDir.mkdirs()) {
            log.error("创建上传目录失败");
            return Result.fail("服务器错误，创建上传目录失败");
        }

        // 构建文件保存路径
        Path filePath = Paths.get(uploadPath, newFileName);
        
        try {
            // 保存文件
            Files.copy(file.getInputStream(), filePath);
            
            // 修改为返回相对路径，而不是完整URL，这样可以被前端代理正确处理
            String fileUrl = "/api/file/download/" + newFileName;
            FileUploadResultDTO uploadResult = new FileUploadResultDTO(fileUrl, newFileName, originalFilename);
            
            log.info("文件上传成功: {}, URL: {}", originalFilename, fileUrl);
            return Result.success(uploadResult);
        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.fail("文件上传失败");
        }
    }

    /**
     * 下载文件
     * @param fileName 文件名
     * @param response HTTP响应
     * @throws IOException IO异常
     */
    @GetMapping("/download/{fileName}")
    public void downloadFile(@PathVariable String fileName, HttpServletResponse response) throws IOException {
        Path filePath = Paths.get(uploadPath, fileName);
        File file = filePath.toFile();
        
        if (!file.exists() || !file.isFile()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        try (FileInputStream fileInputStream = new FileInputStream(file)) {
            // 判断文件类型，设置正确的content-type
            String contentType = determineContentType(fileName);
            response.setContentType(contentType);
            
            // 如果是图片，直接显示，否则作为附件下载
            if (contentType.startsWith("image/")) {
                response.setHeader("Content-Disposition", "inline;filename=" + 
                        URLEncoder.encode(fileName, StandardCharsets.UTF_8));
            } else {
                response.setHeader("Content-Disposition", "attachment;filename=" + 
                        URLEncoder.encode(fileName, StandardCharsets.UTF_8));
            }
            
            response.setContentLength((int) file.length());
            
            // 写入响应流
            OutputStream outputStream = response.getOutputStream();
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = fileInputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            
            outputStream.flush();
            log.info("文件下载成功: {}", fileName);
        } catch (IOException e) {
            log.error("文件下载失败", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * 根据文件名判断内容类型
     * @param fileName 文件名
     * @return 内容类型
     */
    private String determineContentType(String fileName) {
        fileName = fileName.toLowerCase();
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".gif")) {
            return "image/gif";
        } else if (fileName.endsWith(".bmp")) {
            return "image/bmp";
        } else if (fileName.endsWith(".webp")) {
            return "image/webp";
        } else if (fileName.endsWith(".pdf")) {
            return "application/pdf";
        } else {
            return "application/octet-stream";
        }
    }

    /**
     * 批量上传文件
     * @param files 文件列表
     * @return 文件访问URL列表
     */
    @PostMapping("/upload/batch")
    public Result<List<FileUploadResultDTO>> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return Result.fail("未选择任何文件");
        }
        
        List<FileUploadResultDTO> uploadedFiles = new ArrayList<>();
        for (int i = 0; i < files.length; i++) {
            try {
                Result<FileUploadResultDTO> result = uploadFile(files[i]);
                if (result.getCode() == 200) {
                    uploadedFiles.add(result.getData());
                } else {
                    return Result.fail("批量上传失败：" + result.getMessage());
                }
            } catch (IOException e) {
                log.error("批量上传失败", e);
                return Result.fail("批量上传失败");
            }
        }
        
        return Result.success(uploadedFiles);
    }

    @DeleteMapping("/delete/{fileName}")
    public Result<Void> deleteFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadPath, fileName);
            if (!Files.exists(filePath)) {
                return Result.fail("文件不存在");
            }
            Files.delete(filePath);
            return Result.success();
        } catch (IOException e) {
            log.error("文件删除失败", e);
            return Result.fail("文件删除失败");
        }
    }
} 

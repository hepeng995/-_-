package com.cinema.booking.controller;


import com.cinema.booking.annotation.RateLimit;
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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

import jakarta.servlet.http.HttpServletResponse;

@Slf4j
@RestController
@RequestMapping("/file")
@CrossOrigin
public class FileController {

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("jpg", "jpeg", "png", "webp", "gif", "pdf");
    private static final Pattern SAFE_NAME = Pattern.compile(
            "^(?:\\d{4}-\\d{2}/)?[a-zA-Z0-9._-]{1,128}\\.[a-zA-Z0-9]{1,8}$");

    @Value("${server.port:7070}")
    private String port;

    @Value("${file.upload.path:files}")
    private String uploadPath;

    @RateLimit(window = 60, count = 10, key = RateLimit.KeyType.USER, message = "上传过于频繁，请稍后再试")
    @PostMapping("/upload")
    public Result<FileUploadResultDTO> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.fail("文件为空");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            return Result.fail("文件大小不得超过 10MB");
        }

        String originalFilename = file.getOriginalFilename();
        String ext = extractExtension(originalFilename);
        if (ext == null || !ALLOWED_EXTENSIONS.contains(ext)) {
            return Result.fail("不支持的文件类型，仅允许：" + ALLOWED_EXTENSIONS);
        }

        String subDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String storedName = subDir + "/" + UUID.randomUUID().toString().replace("-", "") + "." + ext;

        try {
            Path baseDir = Paths.get(uploadPath).toAbsolutePath().normalize();
            Path target = baseDir.resolve(storedName).normalize();
            if (!target.startsWith(baseDir)) {
                log.warn("拒绝越权写入: {}", target);
                return Result.fail("非法文件名");
            }
            Files.createDirectories(target.getParent());
            Files.copy(file.getInputStream(), target);

            String fileUrl = "/api/file/download/" + storedName;
            FileUploadResultDTO uploadResult = new FileUploadResultDTO(fileUrl, storedName, originalFilename);
            log.info("文件上传成功: {} -> {}", originalFilename, storedName);
            return Result.success(uploadResult);
        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.fail("文件上传失败");
        }
    }

    @GetMapping("/download/{fileName}")
    public void downloadFile(@PathVariable String fileName, HttpServletResponse response) throws IOException {
        Path target = resolveSafe(fileName);
        if (target == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        File file = target.toFile();
        if (!file.exists() || !file.isFile()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        try (FileInputStream fileInputStream = new FileInputStream(file)) {
            String contentType = determineContentType(fileName);
            response.setContentType(contentType);

            String dispName = file.getName();
            if (contentType.startsWith("image/")) {
                response.setHeader("Content-Disposition", "inline;filename=" +
                        URLEncoder.encode(dispName, StandardCharsets.UTF_8));
            } else {
                response.setHeader("Content-Disposition", "attachment;filename=" +
                        URLEncoder.encode(dispName, StandardCharsets.UTF_8));
            }
            response.setContentLength((int) file.length());

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

    @RateLimit(window = 60, count = 5, key = RateLimit.KeyType.USER, message = "批量上传过于频繁，请稍后再试")
    @PostMapping("/upload/batch")
    public Result<List<FileUploadResultDTO>> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return Result.fail("未选择任何文件");
        }
        List<FileUploadResultDTO> uploadedFiles = new ArrayList<>();
        for (MultipartFile f : files) {
            Result<FileUploadResultDTO> result = uploadFile(f);
            if (result.getCode() == 200) {
                uploadedFiles.add(result.getData());
            } else {
                return Result.fail("批量上传失败：" + result.getMessage());
            }
        }
        return Result.success(uploadedFiles);
    }

    @DeleteMapping("/delete/{fileName}")
    public Result<Void> deleteFile(@PathVariable String fileName) {
        Path target = resolveSafe(fileName);
        if (target == null) {
            return Result.fail("非法文件名");
        }
        try {
            if (!Files.exists(target)) {
                return Result.fail("文件不存在");
            }
            Files.delete(target);
            return Result.success();
        } catch (IOException e) {
            log.error("文件删除失败", e);
            return Result.fail("文件删除失败");
        }
    }

    private Path resolveSafe(String name) {
        if (name == null || name.isBlank()) return null;
        String normalized = name.replace('\\', '/');
        if (!SAFE_NAME.matcher(normalized).matches()) {
            log.warn("拒绝非法文件名: {}", name);
            return null;
        }
        Path baseDir = Paths.get(uploadPath).toAbsolutePath().normalize();
        Path target = baseDir.resolve(normalized).normalize();
        if (!target.startsWith(baseDir)) {
            log.warn("拒绝越权访问: {}", target);
            return null;
        }
        return target;
    }

    private String extractExtension(String filename) {
        if (filename == null) return null;
        int idx = filename.lastIndexOf('.');
        if (idx < 0 || idx == filename.length() - 1) return null;
        return filename.substring(idx + 1).toLowerCase(Locale.ROOT);
    }

    private String determineContentType(String fileName) {
        String ext = extractExtension(fileName);
        if (ext == null) return "application/octet-stream";
        return switch (ext) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "bmp" -> "image/bmp";
            case "webp" -> "image/webp";
            case "pdf" -> "application/pdf";
            default -> "application/octet-stream";
        };
    }
}

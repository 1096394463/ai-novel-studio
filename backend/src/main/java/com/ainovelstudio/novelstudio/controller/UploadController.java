package com.ainovelstudio.novelstudio.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Value("${upload.dir:./data/uploads}")
    private String uploadDir;

    @PostMapping("/cover")
    public ResponseEntity<?> uploadCover(@RequestParam("file") MultipartFile file) {
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "只支持图片文件"));
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "图片大小不能超过5MB"));
        }

        // Validate image dimensions (read image)
        try {
            var img = javax.imageio.ImageIO.read(file.getInputStream());
            if (img == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "无法读取图片"));
            }
            int w = img.getWidth();
            int h = img.getHeight();
            // Reasonable cover range: width 200-2000, height 200-3000, aspect ratio 0.3-1.5
            if (w < 200 || w > 2000 || h < 200 || h > 3000) {
                return ResponseEntity.badRequest().body(Map.of("error",
                    String.format("图片尺寸 %dx%d 不合适。推荐 600x800 左右的竖版封面", w, h)));
            }
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "读取图片失败"));
        }

        try {
            // Create upload directory
            Path dir = Paths.get(uploadDir, "covers");
            Files.createDirectories(dir);

            // Generate unique filename
            String ext = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + ext;
            Path target = dir.resolve(filename);

            // Save file
            file.transferTo(target.toFile());

            return ResponseEntity.ok(Map.of(
                "path", target.toAbsolutePath().toString(),
                "url", "/api/upload/covers/" + filename
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "保存文件失败: " + e.getMessage()));
        }
    }

    @GetMapping("/covers/{filename}")
    public ResponseEntity<byte[]> getCover(@PathVariable String filename) throws IOException {
        Path path = Paths.get(uploadDir, "covers", filename);
        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }
        byte[] data = Files.readAllBytes(path);
        String contentType = Files.probeContentType(path);
        if (contentType == null) contentType = "image/jpeg";
        return ResponseEntity.ok()
            .header("Content-Type", contentType)
            .header("Cache-Control", "max-age=86400")
            .body(data);
    }
}

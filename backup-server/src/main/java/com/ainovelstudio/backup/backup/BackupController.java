package com.ainovelstudio.backup.backup;

import com.ainovelstudio.backup.common.ApiResponse;
import com.ainovelstudio.backup.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.UUID;

@RestController
@RequestMapping("/api/backup")
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<BackupInfo> upload(
            Authentication auth,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "deviceId", required = false) UUID deviceId) throws IOException {

        User user = (User) auth.getPrincipal();
        Backup backup = backupService.uploadBackup(user.getId(), deviceId, file);
        return ApiResponse.ok("备份成功", toInfo(backup));
    }

    @GetMapping("/latest")
    public ApiResponse<BackupInfo> latest(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Backup backup = backupService.getLatestBackup(user.getId());
        return ApiResponse.ok(toInfo(backup));
    }

    @GetMapping("/history")
    public ApiResponse<Page<BackupInfo>> history(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = (User) auth.getPrincipal();
        Page<Backup> backups = backupService.getBackupHistory(user.getId(), PageRequest.of(page, size));
        return ApiResponse.ok(backups.map(this::toInfo));
    }

    @GetMapping("/{id}")
    public ApiResponse<BackupInfo> get(Authentication auth, @PathVariable UUID id) {
        User user = (User) auth.getPrincipal();
        Backup backup = backupService.getBackupById(user.getId(), id);
        return ApiResponse.ok(toInfo(backup));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(Authentication auth, @PathVariable UUID id) {
        User user = (User) auth.getPrincipal();
        Path path = backupService.getBackupFile(user.getId(), id);
        Resource resource = new FileSystemResource(path.toFile());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"backup.json\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(Authentication auth, @PathVariable UUID id) {
        User user = (User) auth.getPrincipal();
        backupService.deleteBackup(user.getId(), id);
        return ApiResponse.ok("已删除", null);
    }

    private BackupInfo toInfo(Backup b) {
        BackupInfo info = new BackupInfo();
        info.setId(b.getId());
        info.setVersion(b.getVersion());
        info.setFileSizeBytes(b.getFileSizeBytes());
        info.setNovelCount(b.getNovelCount());
        info.setChapterCount(b.getChapterCount());
        info.setTotalWords(b.getTotalWords());
        info.setChecksum(b.getChecksum());
        info.setCreatedAt(b.getCreatedAt().toString());
        info.setDeviceId(b.getDevice() != null ? b.getDevice().getId() : null);
        info.setDeviceName(b.getDevice() != null ? b.getDevice().getDeviceName() : null);
        return info;
    }

    @lombok.Data
    public static class BackupInfo {
        private UUID id;
        private Integer version;
        private Long fileSizeBytes;
        private Integer novelCount;
        private Integer chapterCount;
        private Long totalWords;
        private String checksum;
        private String createdAt;
        private UUID deviceId;
        private String deviceName;
    }
}

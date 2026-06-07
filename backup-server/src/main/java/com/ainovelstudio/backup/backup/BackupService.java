package com.ainovelstudio.backup.backup;

import com.ainovelstudio.backup.device.Device;
import com.ainovelstudio.backup.device.DeviceService;
import com.ainovelstudio.backup.user.User;
import com.ainovelstudio.backup.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BackupService {

    private final BackupRepository backupRepository;
    private final UserService userService;
    private final DeviceService deviceService;

    @Value("${storage.path}")
    private String storagePath;

    public Backup uploadBackup(UUID userId, UUID deviceId, MultipartFile file) throws IOException {
        User user = userService.findById(userId);
        Device device = deviceId != null ? deviceService.listDevices(userId).stream()
                .filter(d -> d.getId().equals(deviceId)).findFirst().orElse(null) : null;

        // Calculate next version
        int nextVersion = backupRepository.getNextVersion(userId) + 1;

        // Save file
        String relativePath = user.getId() + "/v" + nextVersion + ".json";
        Path absolutePath = Paths.get(storagePath, relativePath);
        Files.createDirectories(absolutePath.getParent());
        file.transferTo(absolutePath.toFile());

        // Calculate checksum
        String checksum = sha256(absolutePath);

        // Parse backup metadata
        int novelCount = 0;
        int chapterCount = 0;
        long totalWords = 0;
        try {
            String content = Files.readString(absolutePath);
            // Simple heuristic parsing
            novelCount = countOccurrences(content, "\"title\":");
            chapterCount = countOccurrences(content, "\"contentJson\":");
        } catch (Exception e) {
            log.warn("Failed to parse backup metadata", e);
        }

        // Create backup record
        Backup backup = new Backup();
        backup.setUser(user);
        backup.setDevice(device);
        backup.setVersion(nextVersion);
        backup.setFilePath(relativePath);
        backup.setFileSizeBytes(file.getSize());
        backup.setNovelCount(novelCount);
        backup.setChapterCount(chapterCount);
        backup.setTotalWords(totalWords);
        backup.setChecksum(checksum);
        backup = backupRepository.save(backup);

        // Update user storage
        userService.updateStorageUsed(userId, file.getSize());

        // Update device last backup time
        if (device != null) {
            deviceService.updateLastBackup(device.getId());
        }

        log.info("Backup uploaded: user={}, version={}, size={}bytes", userId, nextVersion, file.getSize());
        return backup;
    }

    public Backup getLatestBackup(UUID userId) {
        return backupRepository.findFirstByUserIdOrderByVersionDesc(userId)
                .orElseThrow(() -> new IllegalArgumentException("暂无备份"));
    }

    public Backup getBackupById(UUID userId, UUID backupId) {
        Backup backup = backupRepository.findById(backupId)
                .orElseThrow(() -> new IllegalArgumentException("备份不存在"));
        if (!backup.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("无权访问此备份");
        }
        return backup;
    }

    public Path getBackupFile(UUID userId, UUID backupId) {
        Backup backup = getBackupById(userId, backupId);
        return Paths.get(storagePath, backup.getFilePath());
    }

    public Page<Backup> getBackupHistory(UUID userId, Pageable pageable) {
        return backupRepository.findByUserIdOrderByVersionDesc(userId, pageable);
    }

    public void deleteBackup(UUID userId, UUID backupId) {
        Backup backup = getBackupById(userId, backupId);
        try {
            Files.deleteIfExists(Paths.get(storagePath, backup.getFilePath()));
        } catch (IOException e) {
            log.warn("Failed to delete backup file: {}", backup.getFilePath());
        }
        backupRepository.delete(backup);
        userService.updateStorageUsed(userId, -backup.getFileSizeBytes());
    }

    private String sha256(Path path) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(Files.readAllBytes(path));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IOException("Failed to calculate checksum", e);
        }
    }

    private int countOccurrences(String str, String sub) {
        int count = 0, idx = 0;
        while ((idx = str.indexOf(sub, idx)) != -1) {
            count++;
            idx += sub.length();
        }
        return count;
    }
}

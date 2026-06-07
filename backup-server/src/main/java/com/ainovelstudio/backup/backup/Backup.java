package com.ainovelstudio.backup.backup;

import com.ainovelstudio.backup.device.Device;
import com.ainovelstudio.backup.user.User;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "backups")
public class Backup {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private Device device;

    @Column(nullable = false)
    private Integer version;

    @Column(nullable = false, length = 500)
    private String filePath;

    @Column(nullable = false)
    private Long fileSizeBytes = 0L;

    @Column(nullable = false)
    private Integer novelCount = 0;

    @Column(nullable = false)
    private Integer chapterCount = 0;

    @Column(nullable = false)
    private Long totalWords = 0L;

    @Column(length = 64)
    private String checksum;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

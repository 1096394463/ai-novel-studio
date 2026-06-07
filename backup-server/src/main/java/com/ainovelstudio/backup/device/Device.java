package com.ainovelstudio.backup.device;

import com.ainovelstudio.backup.user.User;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "devices")
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String deviceName;

    @Column(nullable = false, length = 20)
    private String deviceType;

    private LocalDateTime lastSeenAt;
    private LocalDateTime lastBackupAt;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

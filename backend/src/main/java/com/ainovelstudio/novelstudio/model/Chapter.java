package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Chapter {
    private String id;
    private String novelId;
    private String volumeId;
    private String title;
    private Integer sortOrder;
    private String contentJson;
    private String contentText;
    private Integer wordCount;
    private String status;
    private Boolean locked;
    private Integer lockedUntilOffset;
    private LocalDateTime lastSavedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

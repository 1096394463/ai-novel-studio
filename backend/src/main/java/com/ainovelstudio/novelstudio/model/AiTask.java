package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AiTask {
    private String id;
    private String novelId;
    private String targetType;
    private String targetId;
    private String taskType;
    private String status;
    private String resultJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

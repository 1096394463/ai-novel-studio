package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Volume {
    private String id;
    private String novelId;
    private String title;
    private Integer sortOrder;
    private String synopsis;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

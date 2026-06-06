package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ImmutableFact {
    private String id;
    private String entityId;
    private String fact;
    private String sourceChapterId;
    private Integer importance;
    private LocalDateTime createdAt;
}

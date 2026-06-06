package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GraphNode {
    private String id;
    private String novelId;
    private String entityId;
    private String nodeType;
    private String label;
    private Double x;
    private Double y;
    private String styleJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

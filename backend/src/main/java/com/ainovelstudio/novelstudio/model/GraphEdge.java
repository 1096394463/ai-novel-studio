package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GraphEdge {
    private String id;
    private String novelId;
    private String sourceNodeId;
    private String targetNodeId;
    private String relationType;
    private String label;
    private String description;
    private List<String> evidenceChapterIds;
    private String styleJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

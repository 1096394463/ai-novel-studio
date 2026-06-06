package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Idea {
    private String id;
    private String novelId;
    private String title;
    private String content;
    private String status;
    private List<String> tags;
    private List<String> relatedEntityIds;
    private String suggestedChapterId;
    private String insertedChapterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

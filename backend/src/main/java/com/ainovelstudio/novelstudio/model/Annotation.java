package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Annotation {
    private String id;
    private String chapterId;
    private String novelId;
    private Integer startOffset;
    private Integer endOffset;
    private String selectedText;
    private String content;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

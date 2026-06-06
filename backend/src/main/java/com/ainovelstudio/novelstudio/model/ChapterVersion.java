package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChapterVersion {
    private String id;
    private String chapterId;
    private String contentJson;
    private String contentText;
    private Integer wordCount;
    private String reason;
    private LocalDateTime createdAt;
}

package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PublishJob {
    private String id;
    private String novelId;
    private String chapterId;
    private String siteId;
    private LocalDateTime scheduledAt;
    private String status;
    private String checkReportJson;
    private String publishLog;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

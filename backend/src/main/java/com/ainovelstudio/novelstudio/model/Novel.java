package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Novel {
    private String id;
    private String title;
    private String genre;
    private String status;
    private String synopsis;
    private String coverPath;
    private Integer totalWords;
    private Integer targetDailyWords;
    private Boolean locked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

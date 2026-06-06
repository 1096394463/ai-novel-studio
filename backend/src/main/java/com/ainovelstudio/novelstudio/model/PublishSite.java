package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PublishSite {
    private String id;
    private String name;
    private String type;
    private String configJson;
    private Boolean enabled;
    private LocalDateTime createdAt;
}

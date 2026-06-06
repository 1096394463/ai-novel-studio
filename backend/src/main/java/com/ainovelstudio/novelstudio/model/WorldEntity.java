package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorldEntity {
    private String id;
    private String novelId;
    private String type;
    private String name;
    private List<String> aliases;
    private String summary;
    private String detailJson;
    private Boolean locked;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

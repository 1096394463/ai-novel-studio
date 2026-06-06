package com.ainovelstudio.novelstudio.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GameMap {
    private String id;
    private String novelId;
    private String title;
    private String mapType;
    private String sceneJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

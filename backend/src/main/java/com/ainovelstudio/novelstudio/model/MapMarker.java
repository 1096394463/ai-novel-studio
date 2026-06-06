package com.ainovelstudio.novelstudio.model;

import lombok.Data;

@Data
public class MapMarker {
    private String id;
    private String mapId;
    private String entityId;
    private String markerType;
    private String label;
    private Double x;
    private Double y;
    private String metadataJson;
}

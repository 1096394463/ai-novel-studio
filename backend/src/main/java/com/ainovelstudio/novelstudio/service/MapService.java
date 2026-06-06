package com.ainovelstudio.novelstudio.service;

import com.ainovelstudio.novelstudio.model.GameMap;
import com.ainovelstudio.novelstudio.model.MapMarker;
import com.ainovelstudio.novelstudio.repository.MapRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class MapService {

    private final MapRepository mapRepository;

    public MapService(MapRepository mapRepository) {
        this.mapRepository = mapRepository;
    }

    // Maps
    public List<GameMap> findByNovelId(String novelId) {
        return mapRepository.findByNovelId(novelId);
    }

    public GameMap findById(String id) {
        return mapRepository.findById(id);
    }

    public GameMap create(GameMap map) {
        map.setId(UUID.randomUUID().toString());
        if (map.getMapType() == null) map.setMapType("world");
        if (map.getSceneJson() == null) map.setSceneJson("{}");
        mapRepository.insert(map);
        return map;
    }

    public GameMap update(String id, GameMap map) {
        GameMap existing = mapRepository.findById(id);
        if (existing == null) {
            throw new RuntimeException("Map not found: " + id);
        }
        if (map.getTitle() != null) existing.setTitle(map.getTitle());
        if (map.getMapType() != null) existing.setMapType(map.getMapType());
        if (map.getSceneJson() != null) existing.setSceneJson(map.getSceneJson());
        mapRepository.update(existing);
        return existing;
    }

    public void delete(String id) {
        mapRepository.delete(id);
    }

    // Markers
    public List<MapMarker> getMarkers(String mapId) {
        return mapRepository.findMarkersByMapId(mapId);
    }

    public MapMarker getMarkerById(String id) {
        return mapRepository.findMarkerById(id);
    }

    public MapMarker addMarker(MapMarker marker) {
        marker.setId(UUID.randomUUID().toString());
        if (marker.getX() == null) marker.setX(0.0);
        if (marker.getY() == null) marker.setY(0.0);
        if (marker.getMetadataJson() == null) marker.setMetadataJson("{}");
        mapRepository.insertMarker(marker);
        return marker;
    }

    public MapMarker updateMarker(String id, MapMarker marker) {
        MapMarker existing = mapRepository.findMarkerById(id);
        if (existing == null) {
            throw new RuntimeException("Marker not found: " + id);
        }
        if (marker.getEntityId() != null) existing.setEntityId(marker.getEntityId());
        if (marker.getMarkerType() != null) existing.setMarkerType(marker.getMarkerType());
        if (marker.getLabel() != null) existing.setLabel(marker.getLabel());
        if (marker.getX() != null) existing.setX(marker.getX());
        if (marker.getY() != null) existing.setY(marker.getY());
        if (marker.getMetadataJson() != null) existing.setMetadataJson(marker.getMetadataJson());
        mapRepository.updateMarker(existing);
        return existing;
    }

    public void deleteMarker(String id) {
        mapRepository.deleteMarker(id);
    }
}

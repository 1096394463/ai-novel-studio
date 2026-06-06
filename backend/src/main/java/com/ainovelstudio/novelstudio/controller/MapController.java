package com.ainovelstudio.novelstudio.controller;

import com.ainovelstudio.novelstudio.model.GameMap;
import com.ainovelstudio.novelstudio.model.MapMarker;
import com.ainovelstudio.novelstudio.service.MapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MapController {

    private final MapService mapService;

    public MapController(MapService mapService) {
        this.mapService = mapService;
    }

    // Maps
    @GetMapping("/novels/{novelId}/maps")
    public List<GameMap> listByNovel(@PathVariable String novelId) {
        return mapService.findByNovelId(novelId);
    }

    @PostMapping("/novels/{novelId}/maps")
    public GameMap create(@PathVariable String novelId, @RequestBody GameMap map) {
        map.setNovelId(novelId);
        return mapService.create(map);
    }

    @GetMapping("/maps/{id}")
    public ResponseEntity<GameMap> get(@PathVariable String id) {
        GameMap map = mapService.findById(id);
        if (map == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(map);
    }

    @PatchMapping("/maps/{id}")
    public ResponseEntity<GameMap> update(@PathVariable String id, @RequestBody GameMap map) {
        try {
            return ResponseEntity.ok(mapService.update(id, map));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/maps/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        mapService.delete(id);
        return ResponseEntity.ok().build();
    }

    // Markers
    @GetMapping("/maps/{mapId}/markers")
    public List<MapMarker> listMarkers(@PathVariable String mapId) {
        return mapService.getMarkers(mapId);
    }

    @PostMapping("/maps/{mapId}/markers")
    public MapMarker addMarker(@PathVariable String mapId, @RequestBody MapMarker marker) {
        marker.setMapId(mapId);
        return mapService.addMarker(marker);
    }

    @PatchMapping("/maps/{mapId}/markers/{markerId}")
    public ResponseEntity<MapMarker> updateMarker(
            @PathVariable String mapId,
            @PathVariable String markerId,
            @RequestBody MapMarker marker) {
        try {
            return ResponseEntity.ok(mapService.updateMarker(markerId, marker));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/maps/{mapId}/markers/{markerId}")
    public ResponseEntity<Void> deleteMarker(@PathVariable String mapId, @PathVariable String markerId) {
        mapService.deleteMarker(markerId);
        return ResponseEntity.ok().build();
    }
}

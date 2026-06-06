package com.ainovelstudio.novelstudio.controller;

import com.ainovelstudio.novelstudio.model.WorldEntity;
import com.ainovelstudio.novelstudio.model.ImmutableFact;
import com.ainovelstudio.novelstudio.service.WorldEntityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class WorldEntityController {

    private final WorldEntityService worldEntityService;

    public WorldEntityController(WorldEntityService worldEntityService) {
        this.worldEntityService = worldEntityService;
    }

    @GetMapping("/novels/{novelId}/entities")
    public List<WorldEntity> listByNovel(
            @PathVariable String novelId,
            @RequestParam(required = false) String type) {
        if (type != null && !type.isEmpty()) {
            return worldEntityService.findByNovelIdAndType(novelId, type);
        }
        return worldEntityService.findByNovelId(novelId);
    }

    @PostMapping("/novels/{novelId}/entities")
    public WorldEntity create(@PathVariable String novelId, @RequestBody WorldEntity entity) {
        entity.setNovelId(novelId);
        return worldEntityService.create(entity);
    }

    @GetMapping("/entities/{id}")
    public ResponseEntity<WorldEntity> get(@PathVariable String id) {
        WorldEntity entity = worldEntityService.findById(id);
        if (entity == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(entity);
    }

    @PatchMapping("/entities/{id}")
    public ResponseEntity<WorldEntity> update(@PathVariable String id, @RequestBody WorldEntity entity) {
        try {
            return ResponseEntity.ok(worldEntityService.update(id, entity));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/entities/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        worldEntityService.delete(id);
        return ResponseEntity.ok().build();
    }

    // Immutable facts
    @GetMapping("/entities/{entityId}/facts")
    public List<ImmutableFact> getFacts(@PathVariable String entityId) {
        return worldEntityService.getFacts(entityId);
    }

    @PostMapping("/entities/{entityId}/facts")
    public ImmutableFact addFact(@PathVariable String entityId, @RequestBody ImmutableFact fact) {
        fact.setEntityId(entityId);
        return worldEntityService.addFact(fact);
    }

    @DeleteMapping("/entities/{entityId}/facts/{factId}")
    public ResponseEntity<Void> deleteFact(@PathVariable String entityId, @PathVariable String factId) {
        worldEntityService.deleteFact(factId);
        return ResponseEntity.ok().build();
    }
}

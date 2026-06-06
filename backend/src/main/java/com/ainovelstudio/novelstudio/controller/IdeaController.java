package com.ainovelstudio.novelstudio.controller;

import com.ainovelstudio.novelstudio.model.Idea;
import com.ainovelstudio.novelstudio.service.IdeaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class IdeaController {

    private final IdeaService ideaService;

    public IdeaController(IdeaService ideaService) {
        this.ideaService = ideaService;
    }

    @GetMapping("/novels/{novelId}/ideas")
    public List<Idea> listByNovel(@PathVariable String novelId) {
        return ideaService.findByNovelId(novelId);
    }

    @PostMapping("/novels/{novelId}/ideas")
    public Idea create(@PathVariable String novelId, @RequestBody Idea idea) {
        idea.setNovelId(novelId);
        return ideaService.create(idea);
    }

    @GetMapping("/ideas/{id}")
    public ResponseEntity<Idea> get(@PathVariable String id) {
        Idea idea = ideaService.findById(id);
        if (idea == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(idea);
    }

    @PatchMapping("/ideas/{id}")
    public ResponseEntity<Idea> update(@PathVariable String id, @RequestBody Idea idea) {
        try {
            return ResponseEntity.ok(ideaService.update(id, idea));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/ideas/{id}/mark-inserted")
    public ResponseEntity<Void> markInserted(@PathVariable String id, @RequestBody Map<String, String> body) {
        String chapterId = body.get("chapterId");
        ideaService.markInserted(id, chapterId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/ideas/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        ideaService.delete(id);
        return ResponseEntity.ok().build();
    }
}

package com.ainovelstudio.novelstudio.controller;

import com.ainovelstudio.novelstudio.model.Novel;
import com.ainovelstudio.novelstudio.service.NovelService;
import com.ainovelstudio.novelstudio.service.ChapterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/novels")
public class NovelController {

    private final NovelService novelService;
    private final ChapterService chapterService;

    public NovelController(NovelService novelService, ChapterService chapterService) {
        this.novelService = novelService;
        this.chapterService = chapterService;
    }

    @GetMapping
    public List<Novel> list() {
        return novelService.findAll();
    }

    @PostMapping
    public Novel create(@RequestBody Novel novel) {
        return novelService.create(novel);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Novel> get(@PathVariable String id) {
        Novel novel = novelService.findById(id);
        if (novel == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(novel);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Novel> update(@PathVariable String id, @RequestBody Novel novel) {
        try {
            return ResponseEntity.ok(novelService.update(id, novel));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/lock")
    public ResponseEntity<Void> lock(@PathVariable String id) {
        novelService.lock(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<Void> unlock(@PathVariable String id) {
        novelService.unlock(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        novelService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/recalculate-words")
    public ResponseEntity<Novel> recalculateWords(@PathVariable String id) {
        int totalWords = chapterService.findByNovelId(id).stream()
                .mapToInt(c -> c.getWordCount() != null ? c.getWordCount() : 0)
                .sum();
        Novel novel = novelService.findById(id);
        if (novel == null) return ResponseEntity.notFound().build();
        novel.setTotalWords(totalWords);
        novelService.update(id, novel);
        return ResponseEntity.ok(novel);
    }
}

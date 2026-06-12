package com.ainovelstudio.novelstudio.controller;

import com.ainovelstudio.novelstudio.model.Chapter;
import com.ainovelstudio.novelstudio.model.ChapterVersion;
import com.ainovelstudio.novelstudio.service.ChapterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChapterController {

    private final ChapterService chapterService;

    public ChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }

    @GetMapping("/novels/{novelId}/chapters")
    public List<Chapter> listByNovel(@PathVariable String novelId) {
        return chapterService.findByNovelId(novelId);
    }

    @PostMapping("/novels/{novelId}/chapters")
    public Chapter create(@PathVariable String novelId, @RequestBody Chapter chapter) {
        chapter.setNovelId(novelId);
        return chapterService.create(chapter);
    }

    @GetMapping("/chapters/{id}")
    public ResponseEntity<Chapter> get(@PathVariable String id) {
        Chapter chapter = chapterService.findById(id);
        if (chapter == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(chapter);
    }

    @PatchMapping("/chapters/{id}")
    public ResponseEntity<Chapter> update(@PathVariable String id, @RequestBody Chapter chapter) {
        try {
            return ResponseEntity.ok(chapterService.update(id, chapter));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/chapters/{id}/save")
    public ResponseEntity<Void> save(@PathVariable String id, @RequestBody Map<String, String> body) {
        String contentJson = body.get("contentJson");
        String contentText = body.get("contentText");
        chapterService.save(id, contentJson, contentText);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/chapters/{id}/lock")
    public ResponseEntity<Void> lock(@PathVariable String id) {
        chapterService.lock(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/chapters/{id}/unlock")
    public ResponseEntity<Void> unlock(@PathVariable String id) {
        chapterService.unlock(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/chapters/{id}/versions")
    public List<ChapterVersion> versions(@PathVariable String id) {
        return chapterService.getVersions(id);
    }

    @PostMapping("/chapters/{id}/restore-version/{versionId}")
    public ResponseEntity<Void> restoreVersion(@PathVariable String id, @PathVariable String versionId) {
        chapterService.restoreVersion(id, versionId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/chapters/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        chapterService.delete(id);
        return ResponseEntity.ok().build();
    }
}

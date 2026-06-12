package com.ainovelstudio.novelstudio.controller;

import com.ainovelstudio.novelstudio.model.Annotation;
import com.ainovelstudio.novelstudio.service.AnnotationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AnnotationController {

    private final AnnotationService annotationService;

    public AnnotationController(AnnotationService annotationService) {
        this.annotationService = annotationService;
    }

    @GetMapping("/chapters/{chapterId}/annotations")
    public List<Annotation> listByChapter(@PathVariable String chapterId) {
        return annotationService.findByChapterId(chapterId);
    }

    @GetMapping("/novels/{novelId}/annotations")
    public List<Annotation> listByNovel(@PathVariable String novelId) {
        return annotationService.findByNovelId(novelId);
    }

    @PostMapping("/annotations")
    public Annotation create(@RequestBody Annotation annotation) {
        return annotationService.create(annotation);
    }

    @PatchMapping("/annotations/{id}")
    public ResponseEntity<Annotation> update(@PathVariable String id, @RequestBody Annotation annotation) {
        try {
            return ResponseEntity.ok(annotationService.update(id, annotation));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/annotations/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        annotationService.delete(id);
        return ResponseEntity.ok().build();
    }
}

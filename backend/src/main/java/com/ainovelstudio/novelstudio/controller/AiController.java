package com.ainovelstudio.novelstudio.controller;

import com.ainovelstudio.novelstudio.model.AiTask;
import com.ainovelstudio.novelstudio.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/tasks/{novelId}")
    public List<AiTask> listTasks(@PathVariable String novelId) {
        return aiService.findByNovelId(novelId);
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<AiTask> getTask(@PathVariable String id) {
        AiTask task = aiService.findById(id);
        if (task == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(task);
    }

    @PostMapping("/grammar-check")
    public AiTask grammarCheck(@RequestBody Map<String, String> body) {
        String chapterId = body.get("chapterId");
        String text = body.get("text");
        return aiService.grammarCheck(chapterId, text);
    }

    @PostMapping("/polish")
    public AiTask polish(@RequestBody Map<String, String> body) {
        String chapterId = body.get("chapterId");
        String text = body.get("text");
        String style = body.get("style");
        return aiService.polish(chapterId, text, style);
    }

    @PostMapping("/expand")
    public AiTask expand(@RequestBody Map<String, String> body) {
        String chapterId = body.get("chapterId");
        String text = body.get("text");
        return aiService.expand(chapterId, text);
    }

    @PostMapping("/consistency-check")
    public AiTask consistencyCheck(@RequestBody Map<String, String> body) {
        String chapterId = body.get("chapterId");
        return aiService.consistencyCheck(chapterId);
    }

    @PostMapping("/idea-suggestions")
    public AiTask ideaSuggestions(@RequestBody Map<String, String> body) {
        String chapterId = body.get("chapterId");
        return aiService.ideaSuggestions(chapterId);
    }
}

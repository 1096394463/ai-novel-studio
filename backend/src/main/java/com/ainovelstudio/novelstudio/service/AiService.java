package com.ainovelstudio.novelstudio.service;

import com.ainovelstudio.novelstudio.model.AiTask;
import com.ainovelstudio.novelstudio.repository.AiTaskRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class AiService {

    private final AiTaskRepository aiTaskRepository;
    private final ChapterService chapterService;
    private final WorldEntityService worldEntityService;

    public AiService(AiTaskRepository aiTaskRepository, 
                     ChapterService chapterService,
                     WorldEntityService worldEntityService) {
        this.aiTaskRepository = aiTaskRepository;
        this.chapterService = chapterService;
        this.worldEntityService = worldEntityService;
    }

    public List<AiTask> findByNovelId(String novelId) {
        return aiTaskRepository.findByNovelId(novelId);
    }

    public AiTask findById(String id) {
        return aiTaskRepository.findById(id);
    }

    public AiTask grammarCheck(String chapterId, String text) {
        AiTask task = createTask(chapterId, "chapter", "grammar");
        // TODO: Implement actual grammar check using LangChain4j
        // For now, return a placeholder result
        task.setStatus("done");
        task.setResultJson("{\"errors\": [], \"correctedText\": \"" + escapeJson(text) + "\"}");
        aiTaskRepository.update(task);
        return task;
    }

    public AiTask polish(String chapterId, String text, String style) {
        AiTask task = createTask(chapterId, "chapter", "polish");
        // TODO: Implement actual polish using LangChain4j
        task.setStatus("done");
        task.setResultJson("{\"versions\": [{\"text\": \"" + escapeJson(text) + "\", \"changes\": []}]}");
        aiTaskRepository.update(task);
        return task;
    }

    public AiTask expand(String chapterId, String text) {
        AiTask task = createTask(chapterId, "chapter", "polish");
        // TODO: Implement actual expand using LangChain4j
        task.setStatus("done");
        task.setResultJson("{\"expandedText\": \"" + escapeJson(text) + "\"}");
        aiTaskRepository.update(task);
        return task;
    }

    public AiTask consistencyCheck(String chapterId) {
        AiTask task = createTask(chapterId, "chapter", "consistency");
        // TODO: Implement actual consistency check using LangChain4j
        // Should check against world entities and immutable facts
        task.setStatus("done");
        task.setResultJson("{\"conflicts\": [], \"suggestions\": []}");
        aiTaskRepository.update(task);
        return task;
    }

    public AiTask ideaSuggestions(String chapterId) {
        AiTask task = createTask(chapterId, "chapter", "idea_suggestion");
        // TODO: Implement actual idea suggestion using LangChain4j
        // Should suggest unused ideas that fit the current chapter
        task.setStatus("done");
        task.setResultJson("{\"suggestions\": []}");
        aiTaskRepository.update(task);
        return task;
    }

    private AiTask createTask(String targetId, String targetType, String taskType) {
        AiTask task = new AiTask();
        task.setId(UUID.randomUUID().toString());
        task.setNovelId(chapterService.findById(targetId).getNovelId());
        task.setTargetType(targetType);
        task.setTargetId(targetId);
        task.setTaskType(taskType);
        task.setStatus("pending");
        aiTaskRepository.insert(task);
        task.setStatus("running");
        aiTaskRepository.update(task);
        return task;
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
}

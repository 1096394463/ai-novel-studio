package com.ainovelstudio.novelstudio.service;

import com.ainovelstudio.novelstudio.model.Idea;
import com.ainovelstudio.novelstudio.repository.IdeaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class IdeaService {

    private final IdeaRepository ideaRepository;

    public IdeaService(IdeaRepository ideaRepository) {
        this.ideaRepository = ideaRepository;
    }

    public List<Idea> findByNovelId(String novelId) {
        return ideaRepository.findByNovelId(novelId);
    }

    public Idea findById(String id) {
        return ideaRepository.findById(id);
    }

    public Idea create(Idea idea) {
        idea.setId(UUID.randomUUID().toString());
        if (idea.getStatus() == null) {
            idea.setStatus("unused");
        }
        if (idea.getTags() == null) {
            idea.setTags(List.of());
        }
        if (idea.getRelatedEntityIds() == null) {
            idea.setRelatedEntityIds(List.of());
        }
        ideaRepository.insert(idea);
        return idea;
    }

    public Idea update(String id, Idea idea) {
        Idea existing = ideaRepository.findById(id);
        if (existing == null) {
            throw new RuntimeException("Idea not found: " + id);
        }
        if (idea.getTitle() != null) existing.setTitle(idea.getTitle());
        if (idea.getContent() != null) existing.setContent(idea.getContent());
        if (idea.getStatus() != null) existing.setStatus(idea.getStatus());
        if (idea.getTags() != null) existing.setTags(idea.getTags());
        if (idea.getRelatedEntityIds() != null) existing.setRelatedEntityIds(idea.getRelatedEntityIds());
        if (idea.getSuggestedChapterId() != null) existing.setSuggestedChapterId(idea.getSuggestedChapterId());
        if (idea.getInsertedChapterId() != null) existing.setInsertedChapterId(idea.getInsertedChapterId());
        ideaRepository.update(existing);
        return existing;
    }

    public void markInserted(String id, String chapterId) {
        Idea idea = ideaRepository.findById(id);
        if (idea == null) {
            throw new RuntimeException("Idea not found: " + id);
        }
        idea.setStatus("inserted");
        idea.setInsertedChapterId(chapterId);
        ideaRepository.update(idea);
    }

    public void delete(String id) {
        ideaRepository.delete(id);
    }
}

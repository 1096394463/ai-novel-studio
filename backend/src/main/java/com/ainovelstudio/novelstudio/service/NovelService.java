package com.ainovelstudio.novelstudio.service;

import com.ainovelstudio.novelstudio.model.Novel;
import com.ainovelstudio.novelstudio.repository.NovelRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class NovelService {

    private final NovelRepository novelRepository;

    public NovelService(NovelRepository novelRepository) {
        this.novelRepository = novelRepository;
    }

    public List<Novel> findAll() {
        return novelRepository.findAll();
    }

    public Novel findById(String id) {
        return novelRepository.findById(id);
    }

    public Novel create(Novel novel) {
        novel.setId(UUID.randomUUID().toString());
        if (novel.getStatus() == null) {
            novel.setStatus("draft");
        }
        if (novel.getTotalWords() == null) {
            novel.setTotalWords(0);
        }
        if (novel.getTargetDailyWords() == null) {
            novel.setTargetDailyWords(2000);
        }
        if (novel.getLocked() == null) {
            novel.setLocked(false);
        }
        novelRepository.insert(novel);
        return novel;
    }

    public Novel update(String id, Novel novel) {
        Novel existing = novelRepository.findById(id);
        if (existing == null) {
            throw new RuntimeException("Novel not found: " + id);
        }
        if (novel.getTitle() != null) existing.setTitle(novel.getTitle());
        if (novel.getGenre() != null) existing.setGenre(novel.getGenre());
        if (novel.getStatus() != null) existing.setStatus(novel.getStatus());
        if (novel.getSynopsis() != null) existing.setSynopsis(novel.getSynopsis());
        if (novel.getCoverPath() != null) existing.setCoverPath(novel.getCoverPath());
        if (novel.getTotalWords() != null) existing.setTotalWords(novel.getTotalWords());
        if (novel.getTargetDailyWords() != null) existing.setTargetDailyWords(novel.getTargetDailyWords());
        if (novel.getLocked() != null) existing.setLocked(novel.getLocked());
        novelRepository.update(existing);
        return existing;
    }

    public void lock(String id) {
        novelRepository.updateLockStatus(id, true);
    }

    public void unlock(String id) {
        novelRepository.updateLockStatus(id, false);
    }

    public void delete(String id) {
        novelRepository.delete(id);
    }
}

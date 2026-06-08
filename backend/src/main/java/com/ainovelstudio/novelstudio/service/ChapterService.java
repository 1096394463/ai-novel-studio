package com.ainovelstudio.novelstudio.service;

import com.ainovelstudio.novelstudio.model.Chapter;
import com.ainovelstudio.novelstudio.model.ChapterVersion;
import com.ainovelstudio.novelstudio.repository.ChapterRepository;
import com.ainovelstudio.novelstudio.repository.NovelRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final NovelRepository novelRepository;

    public ChapterService(ChapterRepository chapterRepository, NovelRepository novelRepository) {
        this.chapterRepository = chapterRepository;
        this.novelRepository = novelRepository;
    }

    public List<Chapter> findByNovelId(String novelId) {
        return chapterRepository.findByNovelId(novelId);
    }

    public Chapter findById(String id) {
        return chapterRepository.findById(id);
    }

    public Chapter create(Chapter chapter) {
        chapter.setId(UUID.randomUUID().toString());
        if (chapter.getStatus() == null) {
            chapter.setStatus("draft");
        }
        if (chapter.getWordCount() == null) {
            chapter.setWordCount(0);
        }
        if (chapter.getLocked() == null) {
            chapter.setLocked(false);
        }
        if (chapter.getContentJson() == null) {
            chapter.setContentJson("{}");
        }
        if (chapter.getContentText() == null) {
            chapter.setContentText("");
        }
        chapterRepository.insert(chapter);
        return chapter;
    }

    public Chapter update(String id, Chapter chapter) {
        Chapter existing = chapterRepository.findById(id);
        if (existing == null) {
            throw new RuntimeException("Chapter not found: " + id);
        }
        if (chapter.getTitle() != null) existing.setTitle(chapter.getTitle());
        if (chapter.getContentJson() != null) existing.setContentJson(chapter.getContentJson());
        if (chapter.getContentText() != null) existing.setContentText(chapter.getContentText());
        if (chapter.getWordCount() != null) existing.setWordCount(chapter.getWordCount());
        if (chapter.getStatus() != null) existing.setStatus(chapter.getStatus());
        if (chapter.getLocked() != null) existing.setLocked(chapter.getLocked());
        if (chapter.getLockedUntilOffset() != null) existing.setLockedUntilOffset(chapter.getLockedUntilOffset());
        chapterRepository.update(existing);
        return existing;
    }

    public void save(String id, String contentJson, String contentText) {
        Chapter chapter = chapterRepository.findById(id);
        if (chapter == null) {
            throw new RuntimeException("Chapter not found: " + id);
        }
        chapter.setContentJson(contentJson);
        chapter.setContentText(contentText);
        chapter.setWordCount(contentText.length());
        chapterRepository.update(chapter);

        // Update novel totalWords
        List<Chapter> allChapters = chapterRepository.findByNovelId(chapter.getNovelId());
        int totalWords = allChapters.stream()
                .mapToInt(c -> c.getWordCount() != null ? c.getWordCount() : 0)
                .sum();
        novelRepository.updateTotalWords(chapter.getNovelId(), totalWords);

        // Create version
        ChapterVersion version = new ChapterVersion();
        version.setId(UUID.randomUUID().toString());
        version.setChapterId(id);
        version.setContentJson(contentJson);
        version.setContentText(contentText);
        version.setWordCount(contentText.length());
        version.setReason("auto_save");
        chapterRepository.insertVersion(version);
    }

    public void lock(String id) {
        chapterRepository.updateLockStatus(id, true);
    }

    public void unlock(String id) {
        chapterRepository.updateLockStatus(id, false);
    }

    public List<ChapterVersion> getVersions(String chapterId) {
        return chapterRepository.findVersionsByChapterId(chapterId);
    }

    public void restoreVersion(String chapterId, String versionId) {
        ChapterVersion version = chapterRepository.findVersionById(versionId);
        if (version == null) {
            throw new RuntimeException("Version not found: " + versionId);
        }
        Chapter chapter = chapterRepository.findById(chapterId);
        if (chapter == null) {
            throw new RuntimeException("Chapter not found: " + chapterId);
        }
        chapter.setContentJson(version.getContentJson());
        chapter.setContentText(version.getContentText());
        chapter.setWordCount(version.getWordCount());
        chapterRepository.update(chapter);
    }

    public void delete(String id) {
        chapterRepository.delete(id);
    }
}

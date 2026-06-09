package com.ainovelstudio.novelstudio.service;

import com.ainovelstudio.novelstudio.model.Annotation;
import com.ainovelstudio.novelstudio.repository.AnnotationRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class AnnotationService {

    private final AnnotationRepository annotationRepository;

    public AnnotationService(AnnotationRepository annotationRepository) {
        this.annotationRepository = annotationRepository;
    }

    public List<Annotation> findByChapterId(String chapterId) {
        return annotationRepository.findByChapterId(chapterId);
    }

    public List<Annotation> findByNovelId(String novelId) {
        return annotationRepository.findByNovelId(novelId);
    }

    public Annotation create(Annotation annotation) {
        annotation.setId(UUID.randomUUID().toString());
        if (annotation.getColor() == null) {
            annotation.setColor("#fef08a"); // yellow highlight
        }
        annotationRepository.insert(annotation);
        return annotation;
    }

    public Annotation update(String id, Annotation annotation) {
        Annotation existing = annotationRepository.findById(id);
        if (existing == null) throw new RuntimeException("Annotation not found");
        if (annotation.getContent() != null) existing.setContent(annotation.getContent());
        if (annotation.getColor() != null) existing.setColor(annotation.getColor());
        annotationRepository.update(existing);
        return existing;
    }

    public void delete(String id) {
        annotationRepository.delete(id);
    }
}

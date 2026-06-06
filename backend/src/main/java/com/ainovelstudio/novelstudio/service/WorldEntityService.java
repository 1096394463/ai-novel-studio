package com.ainovelstudio.novelstudio.service;

import com.ainovelstudio.novelstudio.model.WorldEntity;
import com.ainovelstudio.novelstudio.model.ImmutableFact;
import com.ainovelstudio.novelstudio.repository.WorldEntityRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class WorldEntityService {

    private final WorldEntityRepository worldEntityRepository;

    public WorldEntityService(WorldEntityRepository worldEntityRepository) {
        this.worldEntityRepository = worldEntityRepository;
    }

    public List<WorldEntity> findByNovelId(String novelId) {
        return worldEntityRepository.findByNovelId(novelId);
    }

    public List<WorldEntity> findByNovelIdAndType(String novelId, String type) {
        return worldEntityRepository.findByNovelIdAndType(novelId, type);
    }

    public WorldEntity findById(String id) {
        return worldEntityRepository.findById(id);
    }

    public WorldEntity create(WorldEntity entity) {
        entity.setId(UUID.randomUUID().toString());
        if (entity.getLocked() == null) {
            entity.setLocked(false);
        }
        if (entity.getAliases() == null) {
            entity.setAliases(List.of());
        }
        if (entity.getTags() == null) {
            entity.setTags(List.of());
        }
        if (entity.getSummary() == null) {
            entity.setSummary("");
        }
        if (entity.getDetailJson() == null) {
            entity.setDetailJson("{}");
        }
        worldEntityRepository.insert(entity);
        return entity;
    }

    public WorldEntity update(String id, WorldEntity entity) {
        WorldEntity existing = worldEntityRepository.findById(id);
        if (existing == null) {
            throw new RuntimeException("Entity not found: " + id);
        }
        if (entity.getName() != null) existing.setName(entity.getName());
        if (entity.getAliases() != null) existing.setAliases(entity.getAliases());
        if (entity.getSummary() != null) existing.setSummary(entity.getSummary());
        if (entity.getDetailJson() != null) existing.setDetailJson(entity.getDetailJson());
        if (entity.getLocked() != null) existing.setLocked(entity.getLocked());
        if (entity.getTags() != null) existing.setTags(entity.getTags());
        worldEntityRepository.update(existing);
        return existing;
    }

    public void delete(String id) {
        worldEntityRepository.delete(id);
    }

    // Immutable facts
    public List<ImmutableFact> getFacts(String entityId) {
        return worldEntityRepository.findFactsByEntityId(entityId);
    }

    public ImmutableFact addFact(ImmutableFact fact) {
        fact.setId(UUID.randomUUID().toString());
        if (fact.getImportance() == null) {
            fact.setImportance(3);
        }
        worldEntityRepository.insertFact(fact);
        return fact;
    }

    public void deleteFact(String factId) {
        worldEntityRepository.deleteFact(factId);
    }
}

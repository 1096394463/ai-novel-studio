package com.ainovelstudio.novelstudio.repository;

import com.ainovelstudio.novelstudio.model.WorldEntity;
import com.ainovelstudio.novelstudio.model.ImmutableFact;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface WorldEntityRepository {

    @Select("SELECT * FROM world_entities WHERE novel_id = #{novelId} ORDER BY type, name")
    List<WorldEntity> findByNovelId(String novelId);

    @Select("SELECT * FROM world_entities WHERE novel_id = #{novelId} AND type = #{type} ORDER BY name")
    List<WorldEntity> findByNovelIdAndType(@Param("novelId") String novelId, @Param("type") String type);

    @Select("SELECT * FROM world_entities WHERE id = #{id}")
    WorldEntity findById(String id);

    @Insert("INSERT INTO world_entities (id, novel_id, type, name, aliases, summary, detail_json, locked, tags) " +
            "VALUES (#{id}, #{novelId}, #{type}, #{name}, #{aliases}, #{summary}, #{detailJson}, #{locked}, #{tags})")
    int insert(WorldEntity entity);

    @Update("UPDATE world_entities SET name=#{name}, aliases=#{aliases}, summary=#{summary}, detail_json=#{detailJson}, " +
            "locked=#{locked}, tags=#{tags}, updated_at=datetime('now') WHERE id=#{id}")
    int update(WorldEntity entity);

    @Delete("DELETE FROM world_entities WHERE id = #{id}")
    int delete(String id);

    // Immutable facts
    @Select("SELECT * FROM immutable_facts WHERE entity_id = #{entityId} ORDER BY importance DESC")
    List<ImmutableFact> findFactsByEntityId(String entityId);

    @Insert("INSERT INTO immutable_facts (id, entity_id, fact, source_chapter_id, importance) " +
            "VALUES (#{id}, #{entityId}, #{fact}, #{sourceChapterId}, #{importance})")
    int insertFact(ImmutableFact fact);

    @Delete("DELETE FROM immutable_facts WHERE id = #{id}")
    int deleteFact(String id);
}

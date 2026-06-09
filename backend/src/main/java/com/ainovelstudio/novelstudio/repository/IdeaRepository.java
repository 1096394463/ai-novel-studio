package com.ainovelstudio.novelstudio.repository;

import com.ainovelstudio.novelstudio.model.Idea;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface IdeaRepository {

    @Select("SELECT * FROM ideas WHERE novel_id = #{novelId} ORDER BY created_at DESC")
    @Results({
        @Result(property = "tags", column = "tags", typeHandler = com.ainovelstudio.novelstudio.config.JsonStringListTypeHandler.class),
        @Result(property = "relatedEntityIds", column = "related_entity_ids", typeHandler = com.ainovelstudio.novelstudio.config.JsonStringListTypeHandler.class)
    })
    List<Idea> findByNovelId(String novelId);

    @Select("SELECT * FROM ideas WHERE id = #{id}")
    @Results({
        @Result(property = "tags", column = "tags", typeHandler = com.ainovelstudio.novelstudio.config.JsonStringListTypeHandler.class),
        @Result(property = "relatedEntityIds", column = "related_entity_ids", typeHandler = com.ainovelstudio.novelstudio.config.JsonStringListTypeHandler.class)
    })
    Idea findById(String id);

    @Insert("INSERT INTO ideas (id, novel_id, title, content, status, tags, related_entity_ids, suggested_chapter_id) " +
            "VALUES (#{id}, #{novelId}, #{title}, #{content}, #{status}, #{tags, typeHandler=com.ainovelstudio.novelstudio.config.JsonStringListTypeHandler}, #{relatedEntityIds, typeHandler=com.ainovelstudio.novelstudio.config.JsonStringListTypeHandler}, #{suggestedChapterId})")
    int insert(Idea idea);

    @Update("UPDATE ideas SET title=#{title}, content=#{content}, status=#{status}, tags=#{tags, typeHandler=com.ainovelstudio.novelstudio.config.JsonStringListTypeHandler}, " +
            "related_entity_ids=#{relatedEntityIds, typeHandler=com.ainovelstudio.novelstudio.config.JsonStringListTypeHandler}, suggested_chapter_id=#{suggestedChapterId}, " +
            "inserted_chapter_id=#{insertedChapterId}, updated_at=datetime('now') WHERE id=#{id}")
    int update(Idea idea);

    @Delete("DELETE FROM ideas WHERE id = #{id}")
    int delete(String id);

    @Select("SELECT * FROM ideas WHERE novel_id IS NULL OR novel_id = '' ORDER BY created_at DESC")
    @Results({
        @Result(property = "tags", column = "tags", typeHandler = com.ainovelstudio.novelstudio.config.JsonStringListTypeHandler.class),
        @Result(property = "relatedEntityIds", column = "related_entity_ids", typeHandler = com.ainovelstudio.novelstudio.config.JsonStringListTypeHandler.class)
    })
    List<Idea> findGlobal();
}

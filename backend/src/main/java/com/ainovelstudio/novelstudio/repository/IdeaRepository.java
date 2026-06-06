package com.ainovelstudio.novelstudio.repository;

import com.ainovelstudio.novelstudio.model.Idea;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface IdeaRepository {

    @Select("SELECT * FROM ideas WHERE novel_id = #{novelId} ORDER BY created_at DESC")
    List<Idea> findByNovelId(String novelId);

    @Select("SELECT * FROM ideas WHERE id = #{id}")
    Idea findById(String id);

    @Insert("INSERT INTO ideas (id, novel_id, title, content, status, tags, related_entity_ids, suggested_chapter_id) " +
            "VALUES (#{id}, #{novelId}, #{title}, #{content}, #{status}, #{tags}, #{relatedEntityIds}, #{suggestedChapterId})")
    int insert(Idea idea);

    @Update("UPDATE ideas SET title=#{title}, content=#{content}, status=#{status}, tags=#{tags}, " +
            "related_entity_ids=#{relatedEntityIds}, suggested_chapter_id=#{suggestedChapterId}, " +
            "inserted_chapter_id=#{insertedChapterId}, updated_at=datetime('now') WHERE id=#{id}")
    int update(Idea idea);

    @Delete("DELETE FROM ideas WHERE id = #{id}")
    int delete(String id);
}

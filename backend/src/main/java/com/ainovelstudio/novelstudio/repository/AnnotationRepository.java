package com.ainovelstudio.novelstudio.repository;

import com.ainovelstudio.novelstudio.model.Annotation;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface AnnotationRepository {

    @Select("SELECT * FROM annotations WHERE chapter_id = #{chapterId} ORDER BY start_offset")
    List<Annotation> findByChapterId(String chapterId);

    @Select("SELECT * FROM annotations WHERE novel_id = #{novelId} ORDER BY created_at DESC")
    List<Annotation> findByNovelId(String novelId);

    @Select("SELECT * FROM annotations WHERE id = #{id}")
    Annotation findById(String id);

    @Insert("INSERT INTO annotations (id, chapter_id, novel_id, start_offset, end_offset, selected_text, content, color) " +
            "VALUES (#{id}, #{chapterId}, #{novelId}, #{startOffset}, #{endOffset}, #{selectedText}, #{content}, #{color})")
    int insert(Annotation annotation);

    @Update("UPDATE annotations SET content=#{content}, color=#{color}, updated_at=datetime('now') WHERE id=#{id}")
    int update(Annotation annotation);

    @Delete("DELETE FROM annotations WHERE id = #{id}")
    int delete(String id);
}

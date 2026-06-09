package com.ainovelstudio.novelstudio.repository;

import com.ainovelstudio.novelstudio.model.Chapter;
import com.ainovelstudio.novelstudio.model.ChapterVersion;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface ChapterRepository {

    @Select("SELECT * FROM chapters WHERE novel_id = #{novelId} ORDER BY sort_order DESC")
    List<Chapter> findByNovelId(String novelId);

    @Select("SELECT * FROM chapters WHERE id = #{id}")
    Chapter findById(String id);

    @Insert("INSERT INTO chapters (id, novel_id, volume_id, title, sort_order, content_json, content_text, word_count, status, locked, locked_until_offset) " +
            "VALUES (#{id}, #{novelId}, #{volumeId}, #{title}, #{sortOrder}, #{contentJson}, #{contentText}, #{wordCount}, #{status}, #{locked}, #{lockedUntilOffset})")
    int insert(Chapter chapter);

    @Update("UPDATE chapters SET title=#{title}, content_json=#{contentJson}, content_text=#{contentText}, " +
            "word_count=#{wordCount}, status=#{status}, locked=#{locked}, locked_until_offset=#{lockedUntilOffset}, " +
            "last_saved_at=datetime('now'), updated_at=datetime('now') WHERE id=#{id}")
    int update(Chapter chapter);

    @Update("UPDATE chapters SET locked=#{locked}, updated_at=datetime('now') WHERE id=#{id}")
    int updateLockStatus(@Param("id") String id, @Param("locked") boolean locked);

    @Delete("DELETE FROM chapters WHERE id = #{id}")
    int delete(String id);

    // Chapter versions
    @Select("SELECT * FROM chapter_versions WHERE chapter_id = #{chapterId} ORDER BY created_at DESC")
    List<ChapterVersion> findVersionsByChapterId(String chapterId);

    @Insert("INSERT INTO chapter_versions (id, chapter_id, content_json, content_text, word_count, reason) " +
            "VALUES (#{id}, #{chapterId}, #{contentJson}, #{contentText}, #{wordCount}, #{reason})")
    int insertVersion(ChapterVersion version);

    @Select("SELECT * FROM chapter_versions WHERE id = #{versionId}")
    ChapterVersion findVersionById(String versionId);
}

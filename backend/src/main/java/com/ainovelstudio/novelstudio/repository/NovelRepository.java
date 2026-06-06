package com.ainovelstudio.novelstudio.repository;

import com.ainovelstudio.novelstudio.model.Novel;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface NovelRepository {

    @Select("SELECT * FROM novels ORDER BY updated_at DESC")
    List<Novel> findAll();

    @Select("SELECT * FROM novels WHERE id = #{id}")
    Novel findById(String id);

    @Insert("INSERT INTO novels (id, title, genre, status, synopsis, cover_path, total_words, target_daily_words, locked) " +
            "VALUES (#{id}, #{title}, #{genre}, #{status}, #{synopsis}, #{coverPath}, #{totalWords}, #{targetDailyWords}, #{locked})")
    int insert(Novel novel);

    @Update("UPDATE novels SET title=#{title}, genre=#{genre}, status=#{status}, synopsis=#{synopsis}, " +
            "cover_path=#{coverPath}, total_words=#{totalWords}, target_daily_words=#{targetDailyWords}, " +
            "locked=#{locked}, updated_at=datetime('now') WHERE id=#{id}")
    int update(Novel novel);

    @Update("UPDATE novels SET locked=#{locked}, updated_at=datetime('now') WHERE id=#{id}")
    int updateLockStatus(@Param("id") String id, @Param("locked") boolean locked);

    @Delete("DELETE FROM novels WHERE id = #{id}")
    int delete(String id);
}

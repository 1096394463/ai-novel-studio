package com.ainovelstudio.novelstudio.repository;

import com.ainovelstudio.novelstudio.model.AiTask;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface AiTaskRepository {

    @Select("SELECT * FROM ai_tasks WHERE novel_id = #{novelId} ORDER BY created_at DESC")
    List<AiTask> findByNovelId(String novelId);

    @Select("SELECT * FROM ai_tasks WHERE id = #{id}")
    AiTask findById(String id);

    @Insert("INSERT INTO ai_tasks (id, novel_id, target_type, target_id, task_type, status, result_json) " +
            "VALUES (#{id}, #{novelId}, #{targetType}, #{targetId}, #{taskType}, #{status}, #{resultJson})")
    int insert(AiTask task);

    @Update("UPDATE ai_tasks SET status=#{status}, result_json=#{resultJson}, updated_at=datetime('now') WHERE id=#{id}")
    int update(AiTask task);

    @Delete("DELETE FROM ai_tasks WHERE id = #{id}")
    int delete(String id);
}

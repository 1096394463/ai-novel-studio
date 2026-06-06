package com.ainovelstudio.novelstudio.repository;

import com.ainovelstudio.novelstudio.model.PublishSite;
import com.ainovelstudio.novelstudio.model.PublishJob;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface PublishRepository {

    // Sites
    @Select("SELECT * FROM publish_sites ORDER BY name")
    List<PublishSite> findAllSites();

    @Select("SELECT * FROM publish_sites WHERE id = #{id}")
    PublishSite findSiteById(String id);

    @Insert("INSERT INTO publish_sites (id, name, type, config_json, enabled) " +
            "VALUES (#{id}, #{name}, #{type}, #{configJson}, #{enabled})")
    int insertSite(PublishSite site);

    @Update("UPDATE publish_sites SET name=#{name}, type=#{type}, config_json=#{configJson}, " +
            "enabled=#{enabled} WHERE id=#{id}")
    int updateSite(PublishSite site);

    @Delete("DELETE FROM publish_sites WHERE id = #{id}")
    int deleteSite(String id);

    // Jobs
    @Select("SELECT * FROM publish_jobs ORDER BY scheduled_at DESC")
    List<PublishJob> findAllJobs();

    @Select("SELECT * FROM publish_jobs WHERE novel_id = #{novelId} ORDER BY scheduled_at DESC")
    List<PublishJob> findJobsByNovelId(String novelId);

    @Select("SELECT * FROM publish_jobs WHERE id = #{id}")
    PublishJob findJobById(String id);

    @Insert("INSERT INTO publish_jobs (id, novel_id, chapter_id, site_id, scheduled_at, status, check_report_json) " +
            "VALUES (#{id}, #{novelId}, #{chapterId}, #{siteId}, #{scheduledAt}, #{status}, #{checkReportJson})")
    int insertJob(PublishJob job);

    @Update("UPDATE publish_jobs SET status=#{status}, check_report_json=#{checkReportJson}, " +
            "publish_log=#{publishLog}, updated_at=datetime('now') WHERE id=#{id}")
    int updateJob(PublishJob job);

    @Delete("DELETE FROM publish_jobs WHERE id = #{id}")
    int deleteJob(String id);
}

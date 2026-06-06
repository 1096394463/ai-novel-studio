package com.ainovelstudio.novelstudio.repository;

import com.ainovelstudio.novelstudio.model.GameMap;
import com.ainovelstudio.novelstudio.model.MapMarker;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface MapRepository {

    // Maps
    @Select("SELECT * FROM maps WHERE novel_id = #{novelId} ORDER BY created_at DESC")
    List<GameMap> findByNovelId(String novelId);

    @Select("SELECT * FROM maps WHERE id = #{id}")
    GameMap findById(String id);

    @Insert("INSERT INTO maps (id, novel_id, title, map_type, scene_json) " +
            "VALUES (#{id}, #{novelId}, #{title}, #{mapType}, #{sceneJson})")
    int insert(GameMap map);

    @Update("UPDATE maps SET title=#{title}, map_type=#{mapType}, scene_json=#{sceneJson}, " +
            "updated_at=datetime('now') WHERE id=#{id}")
    int update(GameMap map);

    @Delete("DELETE FROM maps WHERE id = #{id}")
    int delete(String id);

    // Markers
    @Select("SELECT * FROM map_markers WHERE map_id = #{mapId}")
    List<MapMarker> findMarkersByMapId(String mapId);

    @Select("SELECT * FROM map_markers WHERE id = #{id}")
    MapMarker findMarkerById(String id);

    @Insert("INSERT INTO map_markers (id, map_id, entity_id, marker_type, label, x, y, metadata_json) " +
            "VALUES (#{id}, #{mapId}, #{entityId}, #{markerType}, #{label}, #{x}, #{y}, #{metadataJson})")
    int insertMarker(MapMarker marker);

    @Update("UPDATE map_markers SET entity_id=#{entityId}, marker_type=#{markerType}, label=#{label}, " +
            "x=#{x}, y=#{y}, metadata_json=#{metadataJson} WHERE id=#{id}")
    int updateMarker(MapMarker marker);

    @Delete("DELETE FROM map_markers WHERE id = #{id}")
    int deleteMarker(String id);
}

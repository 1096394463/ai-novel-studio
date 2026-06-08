package com.ainovelstudio.novelstudio.repository;

import com.ainovelstudio.novelstudio.model.GraphNode;
import com.ainovelstudio.novelstudio.model.GraphEdge;
import com.ainovelstudio.novelstudio.config.JsonStringListTypeHandler;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface GraphRepository {

    // Nodes
    @Select("SELECT * FROM graph_nodes WHERE novel_id = #{novelId}")
    List<GraphNode> findNodesByNovelId(String novelId);

    @Select("SELECT * FROM graph_nodes WHERE id = #{id}")
    GraphNode findNodeById(String id);

    @Insert("INSERT INTO graph_nodes (id, novel_id, entity_id, node_type, label, x, y, style_json) " +
            "VALUES (#{id}, #{novelId}, #{entityId}, #{nodeType}, #{label}, #{x}, #{y}, #{styleJson})")
    int insertNode(GraphNode node);

    @Update("UPDATE graph_nodes SET label=#{label}, x=#{x}, y=#{y}, entity_id=#{entityId}, " +
            "style_json=#{styleJson}, updated_at=datetime('now') WHERE id=#{id}")
    int updateNode(GraphNode node);

    @Delete("DELETE FROM graph_nodes WHERE id = #{id}")
    int deleteNode(String id);

    // Edges
    @Select("SELECT * FROM graph_edges WHERE novel_id = #{novelId}")
    @Results({
        @Result(property = "evidenceChapterIds", column = "evidence_chapter_ids", typeHandler = JsonStringListTypeHandler.class)
    })
    List<GraphEdge> findEdgesByNovelId(String novelId);

    @Select("SELECT * FROM graph_edges WHERE id = #{id}")
    @Results({
        @Result(property = "evidenceChapterIds", column = "evidence_chapter_ids", typeHandler = JsonStringListTypeHandler.class)
    })
    GraphEdge findEdgeById(String id);

    @Insert("INSERT INTO graph_edges (id, novel_id, source_node_id, target_node_id, relation_type, label, description, evidence_chapter_ids, style_json) " +
            "VALUES (#{id}, #{novelId}, #{sourceNodeId}, #{targetNodeId}, #{relationType}, #{label}, #{description}, #{evidenceChapterIds, typeHandler=JsonStringListTypeHandler}, #{styleJson})")
    int insertEdge(GraphEdge edge);

    @Update("UPDATE graph_edges SET relation_type=#{relationType}, label=#{label}, description=#{description}, " +
            "evidence_chapter_ids=#{evidenceChapterIds, typeHandler=JsonStringListTypeHandler}, style_json=#{styleJson}, updated_at=datetime('now') WHERE id=#{id}")
    int updateEdge(GraphEdge edge);

    @Delete("DELETE FROM graph_edges WHERE id = #{id}")
    int deleteEdge(String id);

    @Delete("DELETE FROM graph_edges WHERE source_node_id = #{nodeId} OR target_node_id = #{nodeId}")
    int deleteEdgesByNodeId(String nodeId);
}

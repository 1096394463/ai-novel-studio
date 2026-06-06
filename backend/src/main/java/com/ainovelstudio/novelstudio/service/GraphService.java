package com.ainovelstudio.novelstudio.service;

import com.ainovelstudio.novelstudio.model.GraphNode;
import com.ainovelstudio.novelstudio.model.GraphEdge;
import com.ainovelstudio.novelstudio.repository.GraphRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class GraphService {

    private final GraphRepository graphRepository;

    public GraphService(GraphRepository graphRepository) {
        this.graphRepository = graphRepository;
    }

    // Nodes
    public List<GraphNode> getNodesByNovelId(String novelId) {
        return graphRepository.findNodesByNovelId(novelId);
    }

    public GraphNode getNodeById(String id) {
        return graphRepository.findNodeById(id);
    }

    public GraphNode createNode(GraphNode node) {
        node.setId(UUID.randomUUID().toString());
        if (node.getX() == null) node.setX(0.0);
        if (node.getY() == null) node.setY(0.0);
        if (node.getStyleJson() == null) node.setStyleJson("{}");
        graphRepository.insertNode(node);
        return node;
    }

    public GraphNode updateNode(String id, GraphNode node) {
        GraphNode existing = graphRepository.findNodeById(id);
        if (existing == null) {
            throw new RuntimeException("Node not found: " + id);
        }
        if (node.getLabel() != null) existing.setLabel(node.getLabel());
        if (node.getX() != null) existing.setX(node.getX());
        if (node.getY() != null) existing.setY(node.getY());
        if (node.getEntityId() != null) existing.setEntityId(node.getEntityId());
        if (node.getStyleJson() != null) existing.setStyleJson(node.getStyleJson());
        graphRepository.updateNode(existing);
        return existing;
    }

    public void deleteNode(String id) {
        graphRepository.deleteEdgesByNodeId(id);
        graphRepository.deleteNode(id);
    }

    // Edges
    public List<GraphEdge> getEdgesByNovelId(String novelId) {
        return graphRepository.findEdgesByNovelId(novelId);
    }

    public GraphEdge getEdgeById(String id) {
        return graphRepository.findEdgeById(id);
    }

    public GraphEdge createEdge(GraphEdge edge) {
        edge.setId(UUID.randomUUID().toString());
        if (edge.getEvidenceChapterIds() == null) edge.setEvidenceChapterIds(List.of());
        if (edge.getStyleJson() == null) edge.setStyleJson("{}");
        graphRepository.insertEdge(edge);
        return edge;
    }

    public GraphEdge updateEdge(String id, GraphEdge edge) {
        GraphEdge existing = graphRepository.findEdgeById(id);
        if (existing == null) {
            throw new RuntimeException("Edge not found: " + id);
        }
        if (edge.getRelationType() != null) existing.setRelationType(edge.getRelationType());
        if (edge.getLabel() != null) existing.setLabel(edge.getLabel());
        if (edge.getDescription() != null) existing.setDescription(edge.getDescription());
        if (edge.getEvidenceChapterIds() != null) existing.setEvidenceChapterIds(edge.getEvidenceChapterIds());
        if (edge.getStyleJson() != null) existing.setStyleJson(edge.getStyleJson());
        graphRepository.updateEdge(existing);
        return existing;
    }

    public void deleteEdge(String id) {
        graphRepository.deleteEdge(id);
    }
}

package com.ainovelstudio.novelstudio.controller;

import com.ainovelstudio.novelstudio.model.GraphNode;
import com.ainovelstudio.novelstudio.model.GraphEdge;
import com.ainovelstudio.novelstudio.service.GraphService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class GraphController {

    private final GraphService graphService;

    public GraphController(GraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping("/novels/{novelId}/graph")
    public Map<String, Object> getGraph(@PathVariable String novelId) {
        List<GraphNode> nodes = graphService.getNodesByNovelId(novelId);
        List<GraphEdge> edges = graphService.getEdgesByNovelId(novelId);
        return Map.of("nodes", nodes, "edges", edges);
    }

    // Nodes
    @PostMapping("/novels/{novelId}/graph/nodes")
    public GraphNode createNode(@PathVariable String novelId, @RequestBody GraphNode node) {
        node.setNovelId(novelId);
        return graphService.createNode(node);
    }

    @PatchMapping("/graph/nodes/{id}")
    public ResponseEntity<GraphNode> updateNode(@PathVariable String id, @RequestBody GraphNode node) {
        try {
            return ResponseEntity.ok(graphService.updateNode(id, node));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/graph/nodes/{id}")
    public ResponseEntity<Void> deleteNode(@PathVariable String id) {
        graphService.deleteNode(id);
        return ResponseEntity.ok().build();
    }

    // Edges
    @PostMapping("/novels/{novelId}/graph/edges")
    public GraphEdge createEdge(@PathVariable String novelId, @RequestBody GraphEdge edge) {
        edge.setNovelId(novelId);
        return graphService.createEdge(edge);
    }

    @PatchMapping("/graph/edges/{id}")
    public ResponseEntity<GraphEdge> updateEdge(@PathVariable String id, @RequestBody GraphEdge edge) {
        try {
            return ResponseEntity.ok(graphService.updateEdge(id, edge));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/graph/edges/{id}")
    public ResponseEntity<Void> deleteEdge(@PathVariable String id) {
        graphService.deleteEdge(id);
        return ResponseEntity.ok().build();
    }
}

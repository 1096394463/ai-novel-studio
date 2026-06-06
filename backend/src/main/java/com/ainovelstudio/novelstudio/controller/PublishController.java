package com.ainovelstudio.novelstudio.controller;

import com.ainovelstudio.novelstudio.model.PublishSite;
import com.ainovelstudio.novelstudio.model.PublishJob;
import com.ainovelstudio.novelstudio.service.PublishService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/publish")
public class PublishController {

    private final PublishService publishService;

    public PublishController(PublishService publishService) {
        this.publishService = publishService;
    }

    // Sites
    @GetMapping("/sites")
    public List<PublishSite> listSites() {
        return publishService.findAllSites();
    }

    @PostMapping("/sites")
    public PublishSite createSite(@RequestBody PublishSite site) {
        return publishService.createSite(site);
    }

    @GetMapping("/sites/{id}")
    public ResponseEntity<PublishSite> getSite(@PathVariable String id) {
        PublishSite site = publishService.findSiteById(id);
        if (site == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(site);
    }

    @PatchMapping("/sites/{id}")
    public ResponseEntity<PublishSite> updateSite(@PathVariable String id, @RequestBody PublishSite site) {
        try {
            return ResponseEntity.ok(publishService.updateSite(id, site));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/sites/{id}")
    public ResponseEntity<Void> deleteSite(@PathVariable String id) {
        publishService.deleteSite(id);
        return ResponseEntity.ok().build();
    }

    // Jobs
    @GetMapping("/jobs")
    public List<PublishJob> listJobs() {
        return publishService.findAllJobs();
    }

    @PostMapping("/jobs")
    public PublishJob createJob(@RequestBody PublishJob job) {
        return publishService.createJob(job);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<PublishJob> getJob(@PathVariable String id) {
        PublishJob job = publishService.findJobById(id);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(job);
    }

    @PostMapping("/jobs/{id}/precheck")
    public ResponseEntity<PublishJob> precheck(@PathVariable String id) {
        try {
            return ResponseEntity.ok(publishService.precheck(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/jobs/{id}/publish")
    public ResponseEntity<PublishJob> publish(@PathVariable String id) {
        try {
            return ResponseEntity.ok(publishService.publish(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/jobs/{id}/logs")
    public ResponseEntity<String> getLogs(@PathVariable String id) {
        try {
            return ResponseEntity.ok(publishService.getLogs(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable String id) {
        publishService.deleteJob(id);
        return ResponseEntity.ok().build();
    }
}

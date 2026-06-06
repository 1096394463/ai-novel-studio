package com.ainovelstudio.novelstudio.service;

import com.ainovelstudio.novelstudio.model.PublishSite;
import com.ainovelstudio.novelstudio.model.PublishJob;
import com.ainovelstudio.novelstudio.repository.PublishRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class PublishService {

    private final PublishRepository publishRepository;

    public PublishService(PublishRepository publishRepository) {
        this.publishRepository = publishRepository;
    }

    // Sites
    public List<PublishSite> findAllSites() {
        return publishRepository.findAllSites();
    }

    public PublishSite findSiteById(String id) {
        return publishRepository.findSiteById(id);
    }

    public PublishSite createSite(PublishSite site) {
        site.setId(UUID.randomUUID().toString());
        if (site.getEnabled() == null) site.setEnabled(true);
        if (site.getConfigJson() == null) site.setConfigJson("{}");
        publishRepository.insertSite(site);
        return site;
    }

    public PublishSite updateSite(String id, PublishSite site) {
        PublishSite existing = publishRepository.findSiteById(id);
        if (existing == null) {
            throw new RuntimeException("Site not found: " + id);
        }
        if (site.getName() != null) existing.setName(site.getName());
        if (site.getType() != null) existing.setType(site.getType());
        if (site.getConfigJson() != null) existing.setConfigJson(site.getConfigJson());
        if (site.getEnabled() != null) existing.setEnabled(site.getEnabled());
        publishRepository.updateSite(existing);
        return existing;
    }

    public void deleteSite(String id) {
        publishRepository.deleteSite(id);
    }

    // Jobs
    public List<PublishJob> findAllJobs() {
        return publishRepository.findAllJobs();
    }

    public List<PublishJob> findJobsByNovelId(String novelId) {
        return publishRepository.findJobsByNovelId(novelId);
    }

    public PublishJob findJobById(String id) {
        return publishRepository.findJobById(id);
    }

    public PublishJob createJob(PublishJob job) {
        job.setId(UUID.randomUUID().toString());
        if (job.getStatus() == null) job.setStatus("scheduled");
        publishRepository.insertJob(job);
        return job;
    }

    public PublishJob precheck(String id) {
        PublishJob job = publishRepository.findJobById(id);
        if (job == null) {
            throw new RuntimeException("Job not found: " + id);
        }
        job.setStatus("checking");
        // TODO: Implement actual precheck logic
        // - Sensitive word scan
        // - Typo check
        // - Chapter lock confirmation
        // - Platform format conversion
        job.setCheckReportJson("{\"status\": \"passed\", \"issues\": []}");
        job.setStatus("scheduled");
        publishRepository.updateJob(job);
        return job;
    }

    public PublishJob publish(String id) {
        PublishJob job = publishRepository.findJobById(id);
        if (job == null) {
            throw new RuntimeException("Job not found: " + id);
        }
        job.setStatus("publishing");
        // TODO: Implement actual publish logic using Playwright
        // This is a placeholder
        job.setPublishLog("Publishing started at " + java.time.LocalDateTime.now());
        job.setStatus("published");
        publishRepository.updateJob(job);
        return job;
    }

    public String getLogs(String id) {
        PublishJob job = publishRepository.findJobById(id);
        if (job == null) {
            throw new RuntimeException("Job not found: " + id);
        }
        return job.getPublishLog();
    }

    public void deleteJob(String id) {
        publishRepository.deleteJob(id);
    }
}

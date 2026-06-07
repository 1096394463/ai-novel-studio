package com.ainovelstudio.backup.backup;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.UUID;

public interface BackupRepository extends JpaRepository<Backup, UUID> {

    Page<Backup> findByUserIdOrderByVersionDesc(UUID userId, Pageable pageable);

    Optional<Backup> findFirstByUserIdOrderByVersionDesc(UUID userId);

    @Query("SELECT COALESCE(MAX(b.version), 0) FROM Backup b WHERE b.user.id = :userId")
    int getNextVersion(UUID userId);

    long countByUserId(UUID userId);
}

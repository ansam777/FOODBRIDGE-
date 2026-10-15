package com.foodbridge.api.repository;

import com.foodbridge.api.model.EmergencyAlert;
import com.foodbridge.api.model.enums.AlertUrgency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmergencyAlertRepository extends JpaRepository<EmergencyAlert, UUID> {

    List<EmergencyAlert> findByIsActiveTrueAndExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now);

    List<EmergencyAlert> findByUrgencyAndIsActiveTrue(AlertUrgency urgency);
}

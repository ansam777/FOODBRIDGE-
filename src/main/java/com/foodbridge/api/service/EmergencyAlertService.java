package com.foodbridge.api.service;

import com.foodbridge.api.dto.EmergencyAlertRequest;
import com.foodbridge.api.model.EmergencyAlert;
import com.foodbridge.api.model.FoodListing;
import com.foodbridge.api.model.User;
import com.foodbridge.api.repository.EmergencyAlertRepository;
import com.foodbridge.api.repository.FoodListingRepository;
import com.foodbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmergencyAlertService {

    private final EmergencyAlertRepository emergencyAlertRepository;
    private final UserRepository userRepository;
    private final FoodListingRepository foodListingRepository;

    @Transactional
    public EmergencyAlert triggerAlert(EmergencyAlertRequest request) {
        User triggerer = userRepository.findById(request.getTriggeredById())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getTriggeredById()));

        FoodListing listing = null;
        if (request.getRelatedListingId() != null) {
            listing = foodListingRepository.findById(request.getRelatedListingId()).orElse(null);
        }

        EmergencyAlert alert = EmergencyAlert.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .urgency(request.getUrgency())
                .triggeredBy(triggerer)
                .relatedListing(listing)
                .targetRadiusKm(request.getTargetRadiusKm() != null ? request.getTargetRadiusKm() : 10.0)
                .latitude(request.getLatitude() != null ? request.getLatitude() : (listing != null ? listing.getLatitude() : triggerer.getLatitude()))
                .longitude(request.getLongitude() != null ? request.getLongitude() : (listing != null ? listing.getLongitude() : triggerer.getLongitude()))
                .isActive(true)
                .broadcastCount(1)
                .expiresAt(LocalDateTime.now().plusHours(3))
                .build();

        return emergencyAlertRepository.save(alert);
    }

    public List<EmergencyAlert> getActiveAlerts() {
        return emergencyAlertRepository.findByIsActiveTrueAndExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime.now());
    }
}

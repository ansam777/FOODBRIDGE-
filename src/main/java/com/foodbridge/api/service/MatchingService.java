package com.foodbridge.api.service;

import com.foodbridge.api.dto.EmergencyAlertRequest;
import com.foodbridge.api.dto.FoodListingResponse;
import com.foodbridge.api.model.FoodListing;
import com.foodbridge.api.model.User;
import com.foodbridge.api.model.enums.AlertUrgency;
import com.foodbridge.api.model.enums.ListingStatus;
import com.foodbridge.api.model.enums.UserRole;
import com.foodbridge.api.repository.FoodListingRepository;
import com.foodbridge.api.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * MatchingService: Implements the 6-Step Smart Proximity Matching Engine.
 * Calculates geographic distances using the Haversine formula, ranks candidate
 * recipients, dispatches volunteer couriers, and triggers Emergency Mode.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MatchingService {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double DEFAULT_MATCH_RADIUS_KM = 5.0;
    private static final long EMERGENCY_EXPIRY_THRESHOLD_HOURS = 2L;

    private final FoodListingRepository foodListingRepository;
    private final UserRepository userRepository;
    private final EmergencyAlertService emergencyAlertService;

    /**
     * MatchResult DTO containing scored and ranked recipient matches.
     */
    @Data
    @Builder
    public static class MatchCandidate {
        private User recipient;
        private double distanceKm;
        private double priorityScore;
        private boolean isEmergencyEligible;
    }

    /**
     * Step 2 & 3: Find and rank candidate recipients within proximity radius for a listing.
     * Evaluates distance, urgency before expiry, and verified NGO status.
     *
     * @param listingId UUID of the surplus listing
     * @param customRadiusKm Optional custom search radius (defaults to 5.0 km)
     * @return List of ranked MatchCandidate objects
     */
    public List<MatchCandidate> findRankedRecipients(UUID listingId, Double customRadiusKm) {
        FoodListing listing = foodListingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + listingId));

        if (listing.getStatus() != ListingStatus.AVAILABLE) {
            log.warn("Listing {} is not available for matching (Status: {})", listingId, listing.getStatus());
            return Collections.emptyList();
        }

        double radius = (customRadiusKm != null && customRadiusKm > 0) ? customRadiusKm : DEFAULT_MATCH_RADIUS_KM;
        List<User> activeRecipients = userRepository.findByRoleAndIsActiveTrue(UserRole.RECIPIENT);

        LocalDateTime now = LocalDateTime.now();
        long hoursToExpiry = Math.max(1, Duration.between(now, listing.getExpiresAt()).toHours());

        List<MatchCandidate> matches = new ArrayList<>();

        for (User recipient : activeRecipients) {
            if (recipient.getLatitude() == null || recipient.getLongitude() == null) {
                continue;
            }

            double distance = calculateDistanceKm(
                    listing.getLatitude(), listing.getLongitude(),
                    recipient.getLatitude(), recipient.getLongitude()
            );

            if (distance <= radius) {
                // Priority Score Formula:
                // Higher score = Higher priority
                // Factors: (1) Inversely proportional to distance,
                //          (2) Higher if listing is close to expiry (urgency boost),
                //          (3) +50 bonus points for verified NGO shelters
                double distanceFactor = Math.max(0.1, (radius - distance) / radius) * 100.0;
                double urgencyFactor = (1.0 / hoursToExpiry) * 50.0;
                double ngoBonus = Boolean.TRUE.equals(recipient.getIsVerifiedNgo()) ? 50.0 : 0.0;
                double totalScore = distanceFactor + urgencyFactor + ngoBonus;

                matches.add(MatchCandidate.builder()
                        .recipient(recipient)
                        .distanceKm(Math.round(distance * 10.0) / 10.0)
                        .priorityScore(Math.round(totalScore * 10.0) / 10.0)
                        .isEmergencyEligible(hoursToExpiry <= EMERGENCY_EXPIRY_THRESHOLD_HOURS)
                        .build());
            }
        }

        // Rank by priority score descending
        matches.sort((a, b) -> Double.compare(b.getPriorityScore(), a.getPriorityScore()));
        log.info("Found {} proximity matches for listing '{}' within {} km", matches.size(), listing.getTitle(), radius);

        return matches;
    }

    /**
     * Step 3: Evaluates if a listing qualifies for Emergency Mode broadcast (< 2h shelf life)
     * and triggers instant community dispatch if active.
     *
     * @param listingId UUID of the listing
     * @return true if emergency broadcast was triggered, false otherwise
     */
    @Transactional
    public boolean evaluateAndTriggerEmergencyMode(UUID listingId) {
        FoodListing listing = foodListingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + listingId));

        LocalDateTime now = LocalDateTime.now();
        Duration remaining = Duration.between(now, listing.getExpiresAt());

        if (listing.getStatus() == ListingStatus.AVAILABLE && remaining.toHours() < EMERGENCY_EXPIRY_THRESHOLD_HOURS) {
            log.warn("EMERGENCY MODE ACTIVATED: Listing '{}' expires in {} minutes!",
                    listing.getTitle(), remaining.toMinutes());

            emergencyAlertService.triggerAlert(EmergencyAlertRequest.builder()
                    .title("URGENT FOOD RESCUE: " + listing.getTitle())
                    .message("Emergency broadcast: " + listing.getQuantityServings() + " portions must be rescued before " + listing.getExpiresAt())
                    .urgency(AlertUrgency.CRITICAL)
                    .triggeredById(listing.getDonor().getId())
                    .relatedListingId(listing.getId())
                    .targetRadiusKm(8.0)
                    .latitude(listing.getLatitude())
                    .longitude(listing.getLongitude())
                    .build());

            return true;
        }

        return false;
    }

    /**
     * Step 5: Matches the nearest active volunteer courier for claims requiring transport logistics.
     *
     * @param pickupLat Pickup latitude
     * @param pickupLon Pickup longitude
     * @param maxRadiusKm Search radius for couriers
     * @return Optional containing closest active volunteer
     */
    public Optional<User> findClosestVolunteer(double pickupLat, double pickupLon, double maxRadiusKm) {
        List<User> volunteers = userRepository.findByRoleAndIsActiveTrue(UserRole.VOLUNTEER);

        return volunteers.stream()
                .filter(v -> v.getLatitude() != null && v.getLongitude() != null)
                .filter(v -> calculateDistanceKm(pickupLat, pickupLon, v.getLatitude(), v.getLongitude()) <= maxRadiusKm)
                .min(Comparator.comparingDouble(v ->
                        calculateDistanceKm(pickupLat, pickupLon, v.getLatitude(), v.getLongitude())));
    }

    /**
     * Haversine formula for calculating great-circle distance between two geographic coordinates.
     *
     * @return Distance in kilometers
     */
    public double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}

package com.foodbridge.api.controller;

import com.foodbridge.api.dto.ApiResponse;
import com.foodbridge.api.dto.FoodListingCreateRequest;
import com.foodbridge.api.dto.FoodListingResponse;
import com.foodbridge.api.service.FoodListingService;
import com.foodbridge.api.service.MatchingService;
import com.foodbridge.api.service.MatchingService.MatchCandidate;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Surplus Food Listings.
 * Handles listing creation, feed discovery, proximity matching, and emergency dispatch.
 */
@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ListingController {

    private final FoodListingService foodListingService;
    private final MatchingService matchingService;

    /**
     * Step 1: Donor posts a new surplus food batch.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FoodListingResponse>> createListing(@Valid @RequestBody FoodListingCreateRequest request) {
        FoodListingResponse created = foodListingService.createListing(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Surplus food listing published successfully", created));
    }

    /**
     * Browse all active and unexpired food listings in the community.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<FoodListingResponse>>> getAvailableListings() {
        List<FoodListingResponse> listings = foodListingService.getAvailableListings();
        return ResponseEntity.ok(ApiResponse.ok("Retrieved available food listings", listings));
    }

    /**
     * Retrieve individual listing details by UUID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodListingResponse>> getListingById(@PathVariable UUID id) {
        FoodListingResponse listing = foodListingService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.ok("Retrieved food listing details", listing));
    }

    /**
     * Step 2: Proximity Match Query - Computes ranked recipient matches within radius.
     */
    @GetMapping("/{id}/matches")
    public ResponseEntity<ApiResponse<List<MatchCandidate>>> getProximityMatches(
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "5.0") Double radiusKm) {
        List<MatchCandidate> matches = matchingService.findRankedRecipients(id, radiusKm);
        return ResponseEntity.ok(ApiResponse.ok("Computed proximity-ranked matches", matches));
    }

    /**
     * Step 3: Trigger Emergency Mode broadcast for expiring listings.
     */
    @PostMapping("/{id}/emergency")
    public ResponseEntity<ApiResponse<Boolean>> triggerEmergencyMode(@PathVariable UUID id) {
        boolean triggered = matchingService.evaluateAndTriggerEmergencyMode(id);
        String message = triggered
                ? "Emergency broadcast dispatched to community shelters"
                : "Listing does not meet emergency urgency criteria (>2h remaining)";
        return ResponseEntity.ok(ApiResponse.ok(message, triggered));
    }
}

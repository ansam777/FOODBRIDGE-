package com.foodbridge.api.service;

import com.foodbridge.api.dto.FoodListingCreateRequest;
import com.foodbridge.api.dto.FoodListingResponse;
import com.foodbridge.api.model.FoodListing;
import com.foodbridge.api.model.User;
import com.foodbridge.api.model.enums.ListingStatus;
import com.foodbridge.api.repository.FoodListingRepository;
import com.foodbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FoodListingService {

    private final FoodListingRepository foodListingRepository;
    private final UserRepository userRepository;

    @Transactional
    public FoodListingResponse createListing(FoodListingCreateRequest request) {
        User donor = userRepository.findById(request.getDonorId())
                .orElseThrow(() -> new IllegalArgumentException("Donor not found with ID: " + request.getDonorId()));

        if (request.getExpiresAt().isBefore(LocalDateTime.now().plusMinutes(30))) {
            throw new IllegalArgumentException("Listing expiry must be at least 30 minutes in the future.");
        }

        FoodListing listing = FoodListing.builder()
                .donor(donor)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .quantityServings(request.getQuantityServings())
                .dietaryTags(request.getDietaryTags())
                .photoUrl(request.getPhotoUrl())
                .pickupAddress(request.getPickupAddress())
                .pickupInstructions(request.getPickupInstructions())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .preparedAt(request.getPreparedAt())
                .expiresAt(request.getExpiresAt())
                .status(ListingStatus.AVAILABLE)
                .isDeliveryAvailable(Boolean.TRUE.equals(request.getIsDeliveryAvailable()))
                .build();

        FoodListing saved = foodListingRepository.save(listing);
        return FoodListingResponse.fromEntity(saved);
    }

    public List<FoodListingResponse> getAvailableListings() {
        return foodListingRepository.findByStatusAndExpiresAtAfterOrderByCreatedAtDesc(
                        ListingStatus.AVAILABLE, LocalDateTime.now())
                .stream()
                .map(FoodListingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public FoodListingResponse getListingById(UUID id) {
        FoodListing listing = foodListingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found with ID: " + id));
        return FoodListingResponse.fromEntity(listing);
    }
}

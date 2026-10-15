package com.foodbridge.api.dto;

import com.foodbridge.api.model.FoodListing;
import com.foodbridge.api.model.enums.FoodCategory;
import com.foodbridge.api.model.enums.ListingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodListingResponse {
    private UUID id;
    private UUID donorId;
    private String donorName;
    private String title;
    private String description;
    private FoodCategory category;
    private Integer quantityServings;
    private String dietaryTags;
    private String photoUrl;
    private String pickupAddress;
    private String pickupInstructions;
    private Double latitude;
    private Double longitude;
    private LocalDateTime preparedAt;
    private LocalDateTime expiresAt;
    private ListingStatus status;
    private Boolean isDeliveryAvailable;
    private LocalDateTime createdAt;

    public static FoodListingResponse fromEntity(FoodListing entity) {
        return FoodListingResponse.builder()
                .id(entity.getId())
                .donorId(entity.getDonor().getId())
                .donorName(entity.getDonor().getFullName())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .quantityServings(entity.getQuantityServings())
                .dietaryTags(entity.getDietaryTags())
                .photoUrl(entity.getPhotoUrl())
                .pickupAddress(entity.getPickupAddress())
                .pickupInstructions(entity.getPickupInstructions())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .preparedAt(entity.getPreparedAt())
                .expiresAt(entity.getExpiresAt())
                .status(entity.getStatus())
                .isDeliveryAvailable(entity.getIsDeliveryAvailable())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

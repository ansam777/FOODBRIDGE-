package com.foodbridge.api.dto;

import com.foodbridge.api.model.enums.FoodCategory;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class FoodListingCreateRequest {

    @NotNull(message = "Donor ID is required")
    private UUID donorId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Category is required")
    private FoodCategory category;

    @NotNull(message = "Quantity of servings is required")
    @Min(value = 1, message = "Quantity must be at least 1 portion")
    private Integer quantityServings;

    private String dietaryTags;
    private String photoUrl;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    private String pickupInstructions;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotNull(message = "Preparation time is required")
    private LocalDateTime preparedAt;

    @NotNull(message = "Expiry time is required")
    @Future(message = "Expiry time must be in the future")
    private LocalDateTime expiresAt;

    @Builder.Default
    private Boolean isDeliveryAvailable = false;
}

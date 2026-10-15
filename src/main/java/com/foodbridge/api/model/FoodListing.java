package com.foodbridge.api.model;

import com.foodbridge.api.model.enums.FoodCategory;
import com.foodbridge.api.model.enums.ListingStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Core Food Listing entity representing surplus food batches posted by donors.
 */
@Entity
@Table(name = "food_listings", indexes = {
    @Index(name = "idx_listing_status", columnList = "status"),
    @Index(name = "idx_listing_expires_at", columnList = "expires_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodListing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    @NotBlank
    @Column(nullable = false, length = 140)
    private String title;

    @Column(length = 1000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FoodCategory category;

    @NotNull
    @Min(1)
    @Column(name = "quantity_servings", nullable = false)
    private Integer quantityServings;

    @Column(name = "dietary_tags")
    private String dietaryTags; // Comma-separated: "Halal,Vegetarian,Gluten-Free"

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @NotBlank
    @Column(name = "pickup_address", nullable = false, length = 255)
    private String pickupAddress;

    @Column(name = "pickup_instructions", length = 500)
    private String pickupInstructions;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @NotNull
    @Column(name = "prepared_at", nullable = false)
    private LocalDateTime preparedAt;

    @NotNull
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ListingStatus status = ListingStatus.AVAILABLE;

    @Column(name = "is_delivery_available", nullable = false)
    @Builder.Default
    private Boolean isDeliveryAvailable = false;

    /**
     * Optimistic lock version to prevent race conditions during concurrent claiming.
     */
    @Version
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

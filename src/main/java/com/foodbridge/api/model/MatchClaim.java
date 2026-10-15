package com.foodbridge.api.model;

import com.foodbridge.api.model.enums.ClaimStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Core MatchClaim entity representing a claim, reservation, and verification lifecycle.
 */
@Entity
@Table(name = "match_claims", indexes = {
    @Index(name = "idx_claim_status", columnList = "status"),
    @Index(name = "idx_claim_handover_otp", columnList = "handover_otp")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private FoodListing listing;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claimant_id", nullable = false)
    private User claimant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_id")
    private User volunteer;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ClaimStatus status = ClaimStatus.PENDING;

    /**
     * Single-use 6-digit numeric OTP verified at handover.
     */
    @NotBlank
    @Size(min = 6, max = 6)
    @Column(name = "handover_otp", nullable = false, length = 6)
    private String handoverOtp;

    /**
     * UUID token for QR code rendering and scanning.
     */
    @NotNull
    @Column(name = "handover_qr_token", nullable = false, length = 64)
    private String handoverQrToken;

    @Column(name = "needs_delivery", nullable = false)
    @Builder.Default
    private Boolean needsDelivery = false;

    @Column(name = "claimed_at", nullable = false)
    private LocalDateTime claimedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.claimedAt == null) {
            this.claimedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

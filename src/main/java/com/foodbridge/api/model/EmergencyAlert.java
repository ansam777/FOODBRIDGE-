package com.foodbridge.api.model;

import com.foodbridge.api.model.enums.AlertUrgency;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * EmergencyAlert entity representing critical food surplus or shortage alerts broadcasted to the community.
 */
@Entity
@Table(name = "emergency_alerts", indexes = {
    @Index(name = "idx_alert_active", columnList = "is_active"),
    @Index(name = "idx_alert_urgency", columnList = "urgency")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(nullable = false, length = 160)
    private String title;

    @NotBlank
    @Column(nullable = false, length = 1000)
    private String message;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AlertUrgency urgency = AlertUrgency.HIGH;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by_id", nullable = false)
    private User triggeredBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id")
    private FoodListing relatedListing;

    @Column(name = "target_radius_km", nullable = false)
    @Builder.Default
    private Double targetRadiusKm = 10.0;

    private Double latitude;

    private Double longitude;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "broadcast_count", nullable = false)
    @Builder.Default
    private Integer broadcastCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.expiresAt == null) {
            // Default emergency alert window is 3 hours unless specified
            this.expiresAt = LocalDateTime.now().plusHours(3);
        }
    }
}

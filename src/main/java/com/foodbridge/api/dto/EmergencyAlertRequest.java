package com.foodbridge.api.dto;

import com.foodbridge.api.model.enums.AlertUrgency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyAlertRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Urgency is required")
    @Builder.Default
    private AlertUrgency urgency = AlertUrgency.HIGH;

    @NotNull(message = "Triggered by user ID is required")
    private UUID triggeredById;

    private UUID relatedListingId;

    @Builder.Default
    private Double targetRadiusKm = 10.0;

    private Double latitude;
    private Double longitude;
}

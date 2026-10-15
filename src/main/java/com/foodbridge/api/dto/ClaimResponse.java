package com.foodbridge.api.dto;

import com.foodbridge.api.model.MatchClaim;
import com.foodbridge.api.model.enums.ClaimStatus;
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
public class ClaimResponse {
    private UUID id;
    private UUID listingId;
    private String listingTitle;
    private UUID claimantId;
    private String claimantName;
    private UUID volunteerId;
    private String volunteerName;
    private ClaimStatus status;
    private String handoverOtp;
    private String handoverQrToken;
    private Boolean needsDelivery;
    private LocalDateTime claimedAt;
    private LocalDateTime completedAt;

    public static ClaimResponse fromEntity(MatchClaim claim) {
        return ClaimResponse.builder()
                .id(claim.getId())
                .listingId(claim.getListing().getId())
                .listingTitle(claim.getListing().getTitle())
                .claimantId(claim.getClaimant().getId())
                .claimantName(claim.getClaimant().getFullName())
                .volunteerId(claim.getVolunteer() != null ? claim.getVolunteer().getId() : null)
                .volunteerName(claim.getVolunteer() != null ? claim.getVolunteer().getFullName() : null)
                .status(claim.getStatus())
                .handoverOtp(claim.getHandoverOtp())
                .handoverQrToken(claim.getHandoverQrToken())
                .needsDelivery(claim.getNeedsDelivery())
                .claimedAt(claim.getClaimedAt())
                .completedAt(claim.getCompletedAt())
                .build();
    }
}

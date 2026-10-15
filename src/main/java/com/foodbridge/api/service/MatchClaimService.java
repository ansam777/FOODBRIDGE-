package com.foodbridge.api.service;

import com.foodbridge.api.dto.ClaimCreateRequest;
import com.foodbridge.api.dto.ClaimResponse;
import com.foodbridge.api.dto.ClaimVerifyOtpRequest;
import com.foodbridge.api.model.FoodListing;
import com.foodbridge.api.model.MatchClaim;
import com.foodbridge.api.model.User;
import com.foodbridge.api.model.enums.ClaimStatus;
import com.foodbridge.api.model.enums.ListingStatus;
import com.foodbridge.api.repository.FoodListingRepository;
import com.foodbridge.api.repository.MatchClaimRepository;
import com.foodbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchClaimService {

    private final MatchClaimRepository matchClaimRepository;
    private final FoodListingRepository foodListingRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public ClaimResponse claimListing(ClaimCreateRequest request) {
        FoodListing listing = foodListingRepository.findById(request.getListingId())
                .orElseThrow(() -> new IllegalArgumentException("Food listing not found: " + request.getListingId()));

        if (listing.getStatus() != ListingStatus.AVAILABLE) {
            throw new IllegalStateException("Listing is no longer available for claiming.");
        }

        if (listing.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Listing has already expired.");
        }

        User claimant = userRepository.findById(request.getClaimantId())
                .orElseThrow(() -> new IllegalArgumentException("Claimant user not found: " + request.getClaimantId()));

        // Generate cryptographically random 6-digit OTP
        int otpNum = 100000 + secureRandom.nextInt(900000);
        String handoverOtp = String.valueOf(otpNum);
        String qrToken = UUID.randomUUID().toString();

        // Lock listing to claimed status
        listing.setStatus(ListingStatus.CLAIMED);
        foodListingRepository.save(listing);

        MatchClaim claim = MatchClaim.builder()
                .listing(listing)
                .claimant(claimant)
                .status(ClaimStatus.PENDING)
                .handoverOtp(handoverOtp)
                .handoverQrToken(qrToken)
                .needsDelivery(Boolean.TRUE.equals(request.getNeedsDelivery()))
                .claimedAt(LocalDateTime.now())
                .build();

        MatchClaim saved = matchClaimRepository.save(claim);
        return ClaimResponse.fromEntity(saved);
    }

    @Transactional
    public ClaimResponse verifyHandoverOtp(ClaimVerifyOtpRequest request) {
        MatchClaim claim = matchClaimRepository.findById(request.getClaimId())
                .orElseThrow(() -> new IllegalArgumentException("Claim not found: " + request.getClaimId()));

        if (claim.getStatus() == ClaimStatus.COMPLETED) {
            throw new IllegalStateException("Handover has already been completed.");
        }

        if (!claim.getHandoverOtp().equals(request.getOtp().trim())) {
            throw new IllegalArgumentException("Invalid OTP code. Handover verification rejected.");
        }

        claim.setStatus(ClaimStatus.COMPLETED);
        claim.setCompletedAt(LocalDateTime.now());

        FoodListing listing = claim.getListing();
        listing.setStatus(ListingStatus.COMPLETED);
        foodListingRepository.save(listing);

        MatchClaim saved = matchClaimRepository.save(claim);
        return ClaimResponse.fromEntity(saved);
    }

    public List<ClaimResponse> getClaimsByClaimant(UUID claimantId) {
        return matchClaimRepository.findByClaimantIdOrderByCreatedAtDesc(claimantId)
                .stream()
                .map(ClaimResponse::fromEntity)
                .collect(Collectors.toList());
    }
}

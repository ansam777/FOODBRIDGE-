package com.foodbridge.api.repository;

import com.foodbridge.api.model.MatchClaim;
import com.foodbridge.api.model.enums.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchClaimRepository extends JpaRepository<MatchClaim, UUID> {

    List<MatchClaim> findByClaimantIdOrderByCreatedAtDesc(UUID claimantId);

    List<MatchClaim> findByVolunteerIdOrderByCreatedAtDesc(UUID volunteerId);

    Optional<MatchClaim> findByListingIdAndStatusNot(UUID listingId, ClaimStatus status);

    Optional<MatchClaim> findByHandoverOtpAndStatus(String handoverOtp, ClaimStatus status);

    Optional<MatchClaim> findByHandoverQrToken(String handoverQrToken);
}

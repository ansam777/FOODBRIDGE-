package com.foodbridge.api.controller;

import com.foodbridge.api.dto.ApiResponse;
import com.foodbridge.api.dto.ClaimCreateRequest;
import com.foodbridge.api.dto.ClaimResponse;
import com.foodbridge.api.dto.ClaimVerifyOtpRequest;
import com.foodbridge.api.service.MatchClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MatchClaimController {

    private final MatchClaimService matchClaimService;

    @PostMapping
    public ResponseEntity<ApiResponse<ClaimResponse>> claimListing(@Valid @RequestBody ClaimCreateRequest request) {
        ClaimResponse claim = matchClaimService.claimListing(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Listing claimed successfully with 6-digit OTP generated", claim));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<ClaimResponse>> verifyHandoverOtp(@Valid @RequestBody ClaimVerifyOtpRequest request) {
        ClaimResponse claim = matchClaimService.verifyHandoverOtp(request);
        return ResponseEntity.ok(ApiResponse.ok("Handover verified successfully via OTP. Listing marked as completed.", claim));
    }

    @GetMapping("/claimant/{claimantId}")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getClaimsByClaimant(@PathVariable UUID claimantId) {
        List<ClaimResponse> claims = matchClaimService.getClaimsByClaimant(claimantId);
        return ResponseEntity.ok(ApiResponse.ok("Retrieved claimant history", claims));
    }
}

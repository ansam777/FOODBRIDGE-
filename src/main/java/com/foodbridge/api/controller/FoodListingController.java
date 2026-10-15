package com.foodbridge.api.controller;

import com.foodbridge.api.dto.ApiResponse;
import com.foodbridge.api.dto.FoodListingCreateRequest;
import com.foodbridge.api.dto.FoodListingResponse;
import com.foodbridge.api.service.FoodListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FoodListingController {

    private final FoodListingService foodListingService;

    @PostMapping
    public ResponseEntity<ApiResponse<FoodListingResponse>> createListing(@Valid @RequestBody FoodListingCreateRequest request) {
        FoodListingResponse created = foodListingService.createListing(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Surplus food listing published successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FoodListingResponse>>> getAvailableListings() {
        List<FoodListingResponse> listings = foodListingService.getAvailableListings();
        return ResponseEntity.ok(ApiResponse.ok("Retrieved available food listings", listings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodListingResponse>> getListingById(@PathVariable UUID id) {
        FoodListingResponse listing = foodListingService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.ok("Retrieved food listing details", listing));
    }
}

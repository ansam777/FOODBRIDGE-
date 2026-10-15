package com.foodbridge.api.repository;

import com.foodbridge.api.model.FoodListing;
import com.foodbridge.api.model.enums.FoodCategory;
import com.foodbridge.api.model.enums.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface FoodListingRepository extends JpaRepository<FoodListing, UUID> {

    List<FoodListing> findByStatusAndExpiresAtAfterOrderByCreatedAtDesc(ListingStatus status, LocalDateTime now);

    List<FoodListing> findByDonorIdOrderByCreatedAtDesc(UUID donorId);

    List<FoodListing> findByCategoryAndStatus(FoodCategory category, ListingStatus status);

    @Query("SELECT f FROM FoodListing f WHERE f.status = 'AVAILABLE' AND f.expiresAt > :now AND f.expiresAt <= :emergencyWindow")
    List<FoodListing> findExpiringSoonListings(@Param("now") LocalDateTime now, @Param("emergencyWindow") LocalDateTime emergencyWindow);
}

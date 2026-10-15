package com.foodbridge.api;

import com.foodbridge.api.model.EmergencyAlert;
import com.foodbridge.api.model.FoodListing;
import com.foodbridge.api.model.User;
import com.foodbridge.api.model.enums.AlertUrgency;
import com.foodbridge.api.model.enums.FoodCategory;
import com.foodbridge.api.model.enums.ListingStatus;
import com.foodbridge.api.model.enums.UserRole;
import com.foodbridge.api.repository.EmergencyAlertRepository;
import com.foodbridge.api.repository.FoodListingRepository;
import com.foodbridge.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@SpringBootApplication
public class FoodBridgeApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodBridgeApiApplication.class, args);
    }

    /**
     * Seed initial demo users and listings for immediate out-of-the-box local testing.
     */
    @Bean
    public CommandLineRunner seedDemoData(
            UserRepository userRepository,
            FoodListingRepository foodListingRepository,
            EmergencyAlertRepository emergencyAlertRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            // 1. Seed Donor
            User donor = User.builder()
                    .email("donor@saffrongrand.com")
                    .fullName("Saffron Grand Restaurant")
                    .passwordHash(passwordEncoder.encode("secret123"))
                    .phone("+1-555-0192")
                    .role(UserRole.DONOR)
                    .addressLine("742 Evergreen Terrace")
                    .city("Downtown Metro")
                    .state("Metro State")
                    .latitude(40.7128)
                    .longitude(-74.0060)
                    .isVerifiedNgo(false)
                    .isActive(true)
                    .build();
            userRepository.save(donor);

            // 2. Seed Recipient (NGO)
            User recipient = User.builder()
                    .email("shelter@communityaid.org")
                    .fullName("Hope Harbor Community Shelter")
                    .passwordHash(passwordEncoder.encode("secret123"))
                    .phone("+1-555-0841")
                    .role(UserRole.RECIPIENT)
                    .addressLine("108 Civic Center Blvd")
                    .city("Downtown Metro")
                    .state("Metro State")
                    .latitude(40.7142)
                    .longitude(-74.0084)
                    .isVerifiedNgo(true)
                    .isActive(true)
                    .build();
            userRepository.save(recipient);

            // 3. Seed Volunteer
            User volunteer = User.builder()
                    .email("volunteer@foodbridge.org")
                    .fullName("Marcus Chen (Volunteer Courier #42)")
                    .passwordHash(passwordEncoder.encode("secret123"))
                    .phone("+1-555-0322")
                    .role(UserRole.VOLUNTEER)
                    .city("Downtown Metro")
                    .latitude(40.7130)
                    .longitude(-74.0070)
                    .isActive(true)
                    .build();
            userRepository.save(volunteer);

            // 4. Seed Surplus Food Listings
            FoodListing listing1 = FoodListing.builder()
                    .donor(donor)
                    .title("Gourmet Biryani & Rice Trays")
                    .description("Hot, unserved catered surplus packed in temperature-controlled steel trays.")
                    .category(FoodCategory.COOKED_MEAL)
                    .quantityServings(45)
                    .dietaryTags("Halal,Gluten-Free")
                    .pickupAddress("742 Evergreen Terrace (Kitchen loading bay)")
                    .pickupInstructions("Ring buzzer at Gate B. Ask for Chef Anand.")
                    .latitude(40.7128)
                    .longitude(-74.0060)
                    .preparedAt(LocalDateTime.now().minusHours(1))
                    .expiresAt(LocalDateTime.now().plusHours(3))
                    .status(ListingStatus.AVAILABLE)
                    .isDeliveryAvailable(true)
                    .build();
            foodListingRepository.save(listing1);

            FoodListing listing2 = FoodListing.builder()
                    .donor(donor)
                    .title("Artisan Sourdough & Croissant Crates")
                    .description("Freshly baked baguettes, seeded rye loaves, and croissants from morning shift.")
                    .category(FoodCategory.BAKERY)
                    .quantityServings(25)
                    .dietaryTags("Vegetarian")
                    .pickupAddress("742 Evergreen Terrace (Bakery front desk)")
                    .latitude(40.7128)
                    .longitude(-74.0060)
                    .preparedAt(LocalDateTime.now().minusHours(3))
                    .expiresAt(LocalDateTime.now().plusHours(5))
                    .status(ListingStatus.AVAILABLE)
                    .isDeliveryAvailable(false)
                    .build();
            foodListingRepository.save(listing2);

            // 5. Seed Emergency Mode Alert
            EmergencyAlert alert = EmergencyAlert.builder()
                    .title("CRITICAL RESCUE: 45 Servings Hot Meals Expiring in 3 Hours")
                    .message("Immediate transport requested for cooked meals from Saffron Grand to any neighborhood community kitchen.")
                    .urgency(AlertUrgency.CRITICAL)
                    .triggeredBy(donor)
                    .relatedListing(listing1)
                    .targetRadiusKm(8.0)
                    .latitude(40.7128)
                    .longitude(-74.0060)
                    .isActive(true)
                    .broadcastCount(12)
                    .expiresAt(LocalDateTime.now().plusHours(3))
                    .build();
            emergencyAlertRepository.save(alert);
        };
    }
}

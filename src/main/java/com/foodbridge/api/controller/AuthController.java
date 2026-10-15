package com.foodbridge.api.controller;

import com.foodbridge.api.dto.ApiResponse;
import com.foodbridge.api.dto.LoginRequest;
import com.foodbridge.api.dto.LoginResponse;
import com.foodbridge.api.model.User;
import com.foodbridge.api.model.enums.UserRole;
import com.foodbridge.api.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

/**
 * Authentication and Persona routing controller for Food Bridge.
 * Authenticates users and directs them immediately to their selected portal (/donate, /feed, /volunteer).
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);

        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            // Determine role from email or explicit request preference
            UserRole assignedRole = UserRole.RECIPIENT;
            if ("donate".equalsIgnoreCase(request.getPreferredDestination()) ||
                    email.contains("donor") || email.contains("restaurant") || email.contains("bakery")) {
                assignedRole = UserRole.DONOR;
            } else if ("volunteer".equalsIgnoreCase(request.getPreferredDestination()) ||
                    email.contains("volunteer") || email.contains("courier") || email.contains("driver")) {
                assignedRole = UserRole.VOLUNTEER;
            }

            String localPart = email.contains("@") ? email.split("@")[0] : email;
            String name = Character.toUpperCase(localPart.charAt(0)) + (localPart.length() > 1 ? localPart.substring(1) : "");

            user = User.builder()
                    .email(email)
                    .fullName(name)
                    .passwordHash("demo_hashed")
                    .role(assignedRole)
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
        }

        // Determine destination redirect URL
        String redirectUrl = switch (user.getRole()) {
            case DONOR -> "/donate";
            case VOLUNTEER -> "/volunteer";
            default -> "/feed";
        };

        if (request.getPreferredDestination() != null && !request.getPreferredDestination().isBlank()) {
            String pref = request.getPreferredDestination().trim().toLowerCase();
            if (pref.contains("donate")) {
                redirectUrl = "/donate";
            } else if (pref.contains("volunteer")) {
                redirectUrl = "/volunteer";
            } else if (pref.contains("feed") || pref.contains("recipient")) {
                redirectUrl = "/feed";
            }
        }

        LoginResponse loginResponse = LoginResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .token("fb_token_" + UUID.randomUUID())
                .redirectUrl(redirectUrl)
                .message("Authentication successful. Directing to " + redirectUrl)
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Login successful", loginResponse));
    }
}

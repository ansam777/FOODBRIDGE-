package com.foodbridge.api.dto;

import com.foodbridge.api.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response payload returned upon successful login, including user role and redirect destination.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private UUID userId;

    private String email;

    private String fullName;

    private UserRole role;

    private String token;

    private String redirectUrl;

    private String message;
}

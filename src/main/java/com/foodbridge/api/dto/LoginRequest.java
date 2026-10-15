package com.foodbridge.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for user login with optional destination preference.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @Email(message = "Valid email is required")
    @NotBlank(message = "Email must not be blank")
    private String email;

    private String password;

    private String preferredDestination;
}

package com.foodbridge.api.controller;

import com.foodbridge.api.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        return ResponseEntity.ok(ApiResponse.ok("Food Bridge Spring Boot API is healthy", Map.of(
                "status", "UP",
                "framework", "Spring Boot 3.3.4",
                "version", "0.0.1-SNAPSHOT",
                "runtime", "Java 17+"
        )));
    }
}

package com.foodbridge.api.controller;

import com.foodbridge.api.dto.ApiResponse;
import com.foodbridge.api.dto.EmergencyAlertRequest;
import com.foodbridge.api.model.EmergencyAlert;
import com.foodbridge.api.service.EmergencyAlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmergencyAlertController {

    private final EmergencyAlertService emergencyAlertService;

    @PostMapping
    public ResponseEntity<ApiResponse<EmergencyAlert>> triggerAlert(@Valid @RequestBody EmergencyAlertRequest request) {
        EmergencyAlert alert = emergencyAlertService.triggerAlert(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Emergency surplus alert triggered and broadcasted to community", alert));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<EmergencyAlert>>> getActiveAlerts() {
        List<EmergencyAlert> alerts = emergencyAlertService.getActiveAlerts();
        return ResponseEntity.ok(ApiResponse.ok("Retrieved active emergency alerts", alerts));
    }
}

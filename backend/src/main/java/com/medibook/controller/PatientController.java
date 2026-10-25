package com.medibook.controller;

import com.medibook.dto.ApiResponse;
import com.medibook.dto.PatientProfileDto;
import com.medibook.dto.PatientUpdateRequest;
import com.medibook.security.UserPrincipal;
import com.medibook.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patient")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Endpoints for patient profile management")
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get current patient's profile")
    public ResponseEntity<ApiResponse<PatientProfileDto>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        PatientProfileDto profile = patientService.getPatientProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Update current patient's profile (age, gender, blood group, emergency contact, phone, address, avatar)")
    public ResponseEntity<ApiResponse<PatientProfileDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PatientUpdateRequest request
    ) {
        PatientProfileDto updated = patientService.updatePatientProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }
}

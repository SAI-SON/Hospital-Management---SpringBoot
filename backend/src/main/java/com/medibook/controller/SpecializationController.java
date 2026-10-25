package com.medibook.controller;

import com.medibook.dto.ApiResponse;
import com.medibook.dto.SpecializationDto;
import com.medibook.service.SpecializationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Specializations", description = "Endpoints for medical specializations")
public class SpecializationController {

    private final SpecializationService specializationService;

    @GetMapping("/specializations")
    @Operation(summary = "List all active specializations", description = "Public endpoint to retrieve all available medical categories")
    public ResponseEntity<ApiResponse<List<SpecializationDto>>> getAllActive() {
        List<SpecializationDto> list = specializationService.getAllActiveSpecializations();
        return ResponseEntity.ok(ApiResponse.success("Specializations retrieved successfully", list));
    }

    @GetMapping("/specializations/{id}")
    @Operation(summary = "Get specialization by ID")
    public ResponseEntity<ApiResponse<SpecializationDto>> getById(@PathVariable Long id) {
        SpecializationDto dto = specializationService.getSpecializationById(id);
        return ResponseEntity.ok(ApiResponse.success("Specialization retrieved successfully", dto));
    }

    @PostMapping("/admin/specializations")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new specialization (Admin only)")
    public ResponseEntity<ApiResponse<SpecializationDto>> create(@Valid @RequestBody SpecializationDto dto) {
        SpecializationDto created = specializationService.createSpecialization(dto);
        return new ResponseEntity<>(ApiResponse.success("Specialization created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/admin/specializations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing specialization (Admin only)")
    public ResponseEntity<ApiResponse<SpecializationDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody SpecializationDto dto) {
        SpecializationDto updated = specializationService.updateSpecialization(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Specialization updated successfully", updated));
    }
}

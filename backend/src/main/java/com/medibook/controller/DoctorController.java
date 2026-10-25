package com.medibook.controller;

import com.medibook.dto.*;
import com.medibook.security.UserPrincipal;
import com.medibook.service.DoctorAvailabilityService;
import com.medibook.service.DoctorService;
import com.medibook.service.SlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Doctors & Availability", description = "Endpoints for doctor discovery, profile management, weekly availability, leaves, and slot generation")
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorAvailabilityService availabilityService;
    private final SlotService slotService;

    // --- PUBLIC ENDPOINTS ---

    @GetMapping("/doctors")
    @Operation(summary = "Search and filter approved doctors", description = "Public search by keyword, specialization, city, fee range, and ratings with sorting and pagination")
    public ResponseEntity<ApiResponse<PageResponse<DoctorSummaryDto>>> searchDoctors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long specializationId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minFee,
            @RequestParam(required = false) BigDecimal maxFee,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ratingAverage") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PageResponse<DoctorSummaryDto> results = doctorService.searchDoctors(
                search, specializationId, city, minFee, maxFee, availableOnly, minRating, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved successfully", results));
    }

    @GetMapping("/doctors/{id}")
    @Operation(summary = "Get doctor details by ID", description = "Public endpoint to view full doctor bio, experience, consultation fee, and weekly schedule")
    public ResponseEntity<ApiResponse<DoctorDetailDto>> getDoctorById(@PathVariable Long id) {
        DoctorDetailDto doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor details retrieved successfully", doctor));
    }

    @GetMapping("/doctors/{id}/slots")
    @Operation(summary = "Get available booking slots for a doctor on a specific date", description = "Returns all unbooked, upcoming slots for patient appointment scheduling")
    public ResponseEntity<ApiResponse<List<SlotDto>>> getAvailableSlots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<SlotDto> slots = slotService.getAvailableSlotsByDoctorAndDate(id, date);
        return ResponseEntity.ok(ApiResponse.success("Available slots retrieved successfully", slots));
    }

    // --- DOCTOR AUTHENTICATED ENDPOINTS ---

    @GetMapping("/doctor/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get logged-in doctor profile")
    public ResponseEntity<ApiResponse<DoctorDetailDto>> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        DoctorDetailDto doctor = doctorService.getDoctorByUserId(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", doctor));
    }

    @PutMapping("/doctor/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update logged-in doctor profile")
    public ResponseEntity<ApiResponse<DoctorDetailDto>> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DoctorUpdateRequest request
    ) {
        DoctorDetailDto current = doctorService.getDoctorByUserId(principal.getId());
        DoctorDetailDto updated = doctorService.updateDoctorProfile(current.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/doctor/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get logged-in doctor's weekly working schedule")
    public ResponseEntity<ApiResponse<List<DoctorAvailabilityDto>>> getMyAvailability(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        DoctorDetailDto current = doctorService.getDoctorByUserId(principal.getId());
        List<DoctorAvailabilityDto> list = availabilityService.getDoctorAvailability(current.getId());
        return ResponseEntity.ok(ApiResponse.success("Availability schedule retrieved", list));
    }

    @PutMapping("/doctor/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Configure logged-in doctor's weekly working schedule")
    public ResponseEntity<ApiResponse<List<DoctorAvailabilityDto>>> setMyAvailability(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody List<DoctorAvailabilityDto> schedule
    ) {
        DoctorDetailDto current = doctorService.getDoctorByUserId(principal.getId());
        List<DoctorAvailabilityDto> updated = availabilityService.setWeeklyAvailability(current.getId(), schedule);
        return ResponseEntity.ok(ApiResponse.success("Weekly availability saved successfully", updated));
    }

    @GetMapping("/doctor/leaves")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get upcoming scheduled leaves for doctor")
    public ResponseEntity<ApiResponse<List<DoctorLeaveDto>>> getMyLeaves(@AuthenticationPrincipal UserPrincipal principal) {
        DoctorDetailDto current = doctorService.getDoctorByUserId(principal.getId());
        List<DoctorLeaveDto> leaves = availabilityService.getDoctorLeaves(current.getId());
        return ResponseEntity.ok(ApiResponse.success("Leaves retrieved successfully", leaves));
    }

    @PostMapping("/doctor/leaves")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Schedule a leave day for doctor")
    public ResponseEntity<ApiResponse<DoctorLeaveDto>> addLeave(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateLeaveRequest request
    ) {
        DoctorDetailDto current = doctorService.getDoctorByUserId(principal.getId());
        DoctorLeaveDto created = availabilityService.addDoctorLeave(current.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Leave scheduled successfully", created), HttpStatus.CREATED);
    }

    @DeleteMapping("/doctor/leaves/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Cancel a scheduled leave day")
    public ResponseEntity<ApiResponse<String>> cancelLeave(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        DoctorDetailDto current = doctorService.getDoctorByUserId(principal.getId());
        availabilityService.cancelDoctorLeave(current.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Leave cancelled successfully"));
    }

    @PostMapping("/doctor/slots/generate")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Generate appointment slots for date range", description = "Generates slots based on weekly availability and excludes leave days (up to 30 days in advance)")
    public ResponseEntity<ApiResponse<String>> generateSlots(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody GenerateSlotsRequest request
    ) {
        DoctorDetailDto current = doctorService.getDoctorByUserId(principal.getId());
        int count = slotService.generateSlots(current.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Generated " + count + " new appointment slots for booking"));
    }
}

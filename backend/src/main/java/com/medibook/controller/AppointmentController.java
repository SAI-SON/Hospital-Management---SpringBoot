package com.medibook.controller;

import com.medibook.dto.*;
import com.medibook.entity.AppointmentStatus;
import com.medibook.security.UserPrincipal;
import com.medibook.service.AppointmentService;
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

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Endpoints for appointment booking, status lifecycle, rescheduling, and cancellations")
public class AppointmentController {

    private final AppointmentService appointmentService;

    // --- PATIENT BOOKING & MANAGEMENT ---

    @PostMapping("/patient/appointments")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Book an appointment", description = "Secures the slot with pessimistic concurrency control, verifies no patient overlaps, and issues a reference code")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> bookAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BookAppointmentRequest request
    ) {
        AppointmentResponseDto response = appointmentService.bookAppointment(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Appointment booked successfully!", response), HttpStatus.CREATED);
    }

    @GetMapping("/patient/appointments")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get current patient's appointments", description = "Retrieves paginated appointment history with filtering by status")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponseDto>>> getPatientAppointments(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<AppointmentResponseDto> response = appointmentService.getPatientAppointments(principal.getId(), status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved successfully", response));
    }

    @PostMapping("/patient/appointments/{id}/cancel")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Cancel an appointment", description = "Permitted up to 2 hours before scheduled time. Automatically releases slot back to available pool.")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> cancelAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CancelAppointmentRequest request
    ) {
        AppointmentResponseDto response = appointmentService.cancelAppointment(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", response));
    }

    @PostMapping("/patient/appointments/{id}/reschedule")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Reschedule an appointment", description = "Permitted up to 2 hours before. Atomically swaps the old slot with the new slot.")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> rescheduleAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody RescheduleAppointmentRequest request
    ) {
        AppointmentResponseDto response = appointmentService.rescheduleAppointment(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment rescheduled successfully", response));
    }

    // --- DOCTOR APPOINTMENT MANAGEMENT ---

    @GetMapping("/doctor/appointments")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get doctor's appointments", description = "Filter doctor's appointments by date and status")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponseDto>>> getDoctorAppointments(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<AppointmentResponseDto> response = appointmentService.getDoctorAppointments(principal.getId(), date, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Doctor appointments retrieved successfully", response));
    }

    @PatchMapping("/doctor/appointments/{id}/status")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update appointment status (Doctor)", description = "Accept (CONFIRMED), Complete (COMPLETED), or Mark No-Show (NO_SHOW)")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam AppointmentStatus status
    ) {
        AppointmentResponseDto response = appointmentService.doctorUpdateStatus(principal.getId(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + status, response));
    }

    @PostMapping("/doctor/appointments/{id}/notes")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Add consultation notes to appointment (Doctor)")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> addNotes(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ConsultationNotesRequest request
    ) {
        AppointmentResponseDto response = appointmentService.doctorAddConsultationNotes(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Consultation notes updated successfully", response));
    }

    @GetMapping("/appointments/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get appointment details by ID")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> getAppointmentById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        AppointmentResponseDto response = appointmentService.getAppointmentById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Appointment retrieved successfully", response));
    }
}

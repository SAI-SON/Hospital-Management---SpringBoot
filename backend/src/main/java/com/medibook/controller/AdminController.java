package com.medibook.controller;

import com.medibook.dto.*;
import com.medibook.entity.UserStatus;
import com.medibook.service.AdminService;
import com.medibook.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Operations", description = "Endpoints for platform administration, user oversight, doctor verification, and audit logs")
public class AdminController {

    private final AdminService adminService;
    private final AuditLogService auditLogService;

    @GetMapping("/stats")
    @Operation(summary = "Get system-wide metrics and chart analytics")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDto>> getStats() {
        AdminDashboardStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard stats retrieved", stats));
    }

    @GetMapping("/users")
    @Operation(summary = "Get paginated user directory with search and role filters")
    public ResponseEntity<ApiResponse<PageResponse<UserAdminDto>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<UserAdminDto> users = adminService.getUsers(search, role, page, size);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @PatchMapping("/users/{id}/lock")
    @Operation(summary = "Lock or unlock a user account")
    public ResponseEntity<ApiResponse<String>> toggleUserLock(
            @PathVariable Long id,
            @RequestParam boolean unlock
    ) {
        adminService.toggleUserLock(id, unlock);
        return ResponseEntity.ok(ApiResponse.success(unlock ? "User unlocked successfully" : "User locked successfully"));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Update user account status (ACTIVE, SUSPENDED, PENDING_VERIFICATION)")
    public ResponseEntity<ApiResponse<String>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status
    ) {
        adminService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("User status updated to " + status));
    }

    @GetMapping("/doctors")
    @Operation(summary = "Get list of doctors for approval and verification")
    public ResponseEntity<ApiResponse<PageResponse<DoctorDetailDto>>> getDoctors(
            @RequestParam(required = false) Boolean approved,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<DoctorDetailDto> doctors = adminService.getAllDoctors(approved, page, size);
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved successfully", doctors));
    }

    @PatchMapping("/doctors/{id}/approve")
    @Operation(summary = "Approve or reject a doctor application")
    public ResponseEntity<ApiResponse<DoctorDetailDto>> approveDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorApprovalRequest request
    ) {
        DoctorDetailDto doctor = adminService.approveDoctor(id, request);
        return ResponseEntity.ok(ApiResponse.success("Doctor status updated successfully", doctor));
    }

    @GetMapping("/appointments")
    @Operation(summary = "View and filter all appointments across the hospital")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponseDto>>> getAllAppointments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<AppointmentResponseDto> appointments = adminService.getAllAppointments(status, fromDate, toDate, page, size);
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved successfully", appointments));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "View system audit trail")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        PageResponse<AuditLogDto> logs = auditLogService.getAuditLogs(action, page, size);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved successfully", logs));
    }
}

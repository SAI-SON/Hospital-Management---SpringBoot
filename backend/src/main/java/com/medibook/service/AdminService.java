package com.medibook.service;

import com.medibook.dto.*;
import com.medibook.entity.UserStatus;

import java.time.LocalDate;

public interface AdminService {
    AdminDashboardStatsDto getDashboardStats();
    PageResponse<UserAdminDto> getUsers(String search, String role, int page, int size);
    void toggleUserLock(Long userId, boolean unlock);
    void updateUserStatus(Long userId, UserStatus status);
    DoctorDetailDto approveDoctor(Long doctorId, DoctorApprovalRequest request);
    PageResponse<DoctorDetailDto> getAllDoctors(Boolean approved, int page, int size);
    PageResponse<AppointmentResponseDto> getAllAppointments(String status, LocalDate fromDate, LocalDate toDate, int page, int size);
}

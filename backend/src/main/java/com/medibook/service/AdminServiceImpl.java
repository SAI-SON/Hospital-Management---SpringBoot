package com.medibook.service;

import com.medibook.dto.*;
import com.medibook.entity.*;
import com.medibook.exception.BadRequestException;
import com.medibook.exception.ResourceNotFoundException;
import com.medibook.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;
    private final DoctorService doctorService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.countByIsApproved(true);
        long pendingApprovals = doctorRepository.countByIsApproved(false);
        long totalAppointments = appointmentRepository.count();
        long todayAppointments = appointmentRepository.countByAppointmentDate(LocalDate.now());
        BigDecimal totalRevenue = appointmentRepository.calculateTotalRevenue();

        // 7-day appointment trend
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(6);
        List<Object[]> dailyCounts = appointmentRepository.countAppointmentsPerDaySince(sevenDaysAgo);
        Map<String, Long> dateMap = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            dateMap.put(LocalDate.now().minusDays(i).toString(), 0L);
        }
        for (Object[] row : dailyCounts) {
            if (row != null && row.length >= 2 && row[0] != null) {
                dateMap.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }
        List<AdminDashboardStatsDto.DailyAppointmentStat> dailyStats = dateMap.entrySet().stream()
                .map(e -> new AdminDashboardStatsDto.DailyAppointmentStat(e.getKey(), e.getValue()))
                .toList();

        // Specialization distribution
        List<Object[]> specCounts = appointmentRepository.countAppointmentsBySpecialization();
        List<AdminDashboardStatsDto.SpecializationStat> specStats = specCounts.stream()
                .map(r -> new AdminDashboardStatsDto.SpecializationStat((String) r[0], ((Number) r[1]).longValue()))
                .toList();

        // Status counts
        Map<String, Long> statusCounts = new HashMap<>();
        for (AppointmentStatus s : AppointmentStatus.values()) {
            statusCounts.put(s.name(), appointmentRepository.countByStatus(s));
        }

        return AdminDashboardStatsDto.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .pendingDoctorApprovals(pendingApprovals)
                .totalAppointments(totalAppointments)
                .todayAppointments(todayAppointments)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .appointmentsPerDay(dailyStats)
                .appointmentsPerSpecialization(specStats)
                .appointmentsByStatus(statusCounts)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserAdminDto> getUsers(String search, String role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        RoleName roleName = null;
        if (role != null && !role.isBlank()) {
            try {
                roleName = RoleName.valueOf(role.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        Page<User> usersPage = userRepository.searchUsers(
                (search != null && !search.isBlank()) ? search.trim() : null,
                roleName,
                pageable
        );

        List<UserAdminDto> content = usersPage.getContent().stream()
                .map(this::toUserAdminDto)
                .toList();

        return PageResponse.<UserAdminDto>builder()
                .content(content)
                .pageNumber(usersPage.getNumber())
                .pageSize(usersPage.getSize())
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .isLast(usersPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public void toggleUserLock(Long userId, boolean unlock) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (unlock) {
            user.setLockUntil(null);
            user.setFailedLoginAttempts(0);
        } else {
            user.setLockUntil(Instant.now().plus(Duration.ofDays(365)));
        }
        userRepository.save(user);

        auditLogService.logAction(null, unlock ? "UNLOCK_USER" : "LOCK_USER", "User", userId.toString(), null, null, "User email: " + user.getEmail());
    }

    @Override
    @Transactional
    public void updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setStatus(status);
        userRepository.save(user);

        auditLogService.logAction(null, "UPDATE_USER_STATUS", "User", userId.toString(), null, null, "Status set to: " + status);
    }

    @Override
    @Transactional
    public DoctorDetailDto approveDoctor(Long doctorId, DoctorApprovalRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        doctor.setApproved(Boolean.TRUE.equals(request.getApproved()));
        doctorRepository.save(doctor);

        String message = Boolean.TRUE.equals(request.getApproved())
                ? "Your doctor profile has been verified and approved by the MediBook administration. You are now live!"
                : "Your doctor application was rejected. Reason: " + (request.getReason() != null ? request.getReason() : "Incomplete credentials");

        notificationService.createNotification(
                doctor.getUser(),
                Boolean.TRUE.equals(request.getApproved()) ? "Account Approved" : "Account Status Update",
                message,
                "SYSTEM"
        );

        auditLogService.logAction(null, Boolean.TRUE.equals(request.getApproved()) ? "APPROVE_DOCTOR" : "REJECT_DOCTOR", "Doctor", doctorId.toString(), null, null, "Doctor: " + doctor.getFullName());

        return doctorService.getDoctorById(doctorId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DoctorDetailDto> getAllDoctors(Boolean approved, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Doctor> doctorPage;
        if (approved != null) {
            doctorPage = doctorRepository.findByIsApproved(approved, pageable);
        } else {
            doctorPage = doctorRepository.findAll(pageable);
        }

        List<DoctorDetailDto> content = doctorPage.getContent().stream()
                .map(d -> doctorService.getDoctorById(d.getId()))
                .toList();

        return PageResponse.<DoctorDetailDto>builder()
                .content(content)
                .pageNumber(doctorPage.getNumber())
                .pageSize(doctorPage.getSize())
                .totalElements(doctorPage.getTotalElements())
                .totalPages(doctorPage.getTotalPages())
                .isLast(doctorPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AppointmentResponseDto> getAllAppointments(String status, LocalDate fromDate, LocalDate toDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        AppointmentStatus appointmentStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                appointmentStatus = AppointmentStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        Page<Appointment> aptPage = appointmentRepository.findAllWithFilters(
                appointmentStatus, fromDate, toDate, pageable);

        List<AppointmentResponseDto> content = aptPage.getContent().stream()
                .map(this::toAppointmentDto)
                .toList();

        return PageResponse.<AppointmentResponseDto>builder()
                .content(content)
                .pageNumber(aptPage.getNumber())
                .pageSize(aptPage.getSize())
                .totalElements(aptPage.getTotalElements())
                .totalPages(aptPage.getTotalPages())
                .isLast(aptPage.isLast())
                .build();
    }

    private UserAdminDto toUserAdminDto(User u) {
        String fullName = null;
        String phone = null;
        if (u.getRole().getName() == RoleName.ROLE_PATIENT) {
            Optional<Patient> p = patientRepository.findByUserId(u.getId());
            if (p.isPresent()) {
                fullName = p.get().getFullName();
                phone = p.get().getPhoneNumber();
            }
        } else if (u.getRole().getName() == RoleName.ROLE_DOCTOR) {
            Optional<Doctor> d = doctorRepository.findByUserId(u.getId());
            if (d.isPresent()) {
                fullName = d.get().getFullName();
                phone = d.get().getPhoneNumber();
            }
        }

        return UserAdminDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .role(u.getRole().getName().name())
                .status(u.getStatus())
                .fullName(fullName != null ? fullName : "N/A")
                .phoneNumber(phone != null ? phone : "N/A")
                .failedLoginAttempts(u.getFailedLoginAttempts())
                .lockUntil(u.getLockUntil())
                .isDeleted(u.isDeleted())
                .createdAt(u.getCreatedAt())
                .build();
    }

    private AppointmentResponseDto toAppointmentDto(Appointment apt) {
        Instant now = Instant.now();
        Instant deadline = apt.getSlot().getSlotStart().minus(Duration.ofHours(2));
        boolean withinCancelWindow = now.isBefore(deadline);

        return AppointmentResponseDto.builder()
                .id(apt.getId())
                .referenceNo(apt.getReferenceNo())
                .patientId(apt.getPatient().getId())
                .patientName(apt.getPatient().getFullName())
                .patientPhone(apt.getPatient().getPhoneNumber())
                .doctorId(apt.getDoctor().getId())
                .doctorName(apt.getDoctor().getFullName())
                .doctorSpecialization(apt.getDoctor().getSpecialization().getName())
                .doctorFee(apt.getDoctor().getConsultationFee())
                .doctorAvatarUrl(apt.getDoctor().getAvatarUrl())
                .clinicCity(apt.getDoctor().getClinicCity())
                .clinicAddress(apt.getDoctor().getClinicAddress())
                .slotId(apt.getSlot().getId())
                .appointmentDate(apt.getAppointmentDate())
                .startTime(apt.getStartTime())
                .endTime(apt.getEndTime())
                .status(apt.getStatus().name())
                .reason(apt.getReason())
                .consultationNotes(apt.getConsultationNotes())
                .cancellationReason(apt.getCancellationReason())
                .cancelledAt(apt.getCancelledAt())
                .createdAt(apt.getCreatedAt())
                .canCancel(withinCancelWindow && (apt.getStatus() == AppointmentStatus.PENDING || apt.getStatus() == AppointmentStatus.CONFIRMED))
                .canReschedule(withinCancelWindow && (apt.getStatus() == AppointmentStatus.PENDING || apt.getStatus() == AppointmentStatus.CONFIRMED))
                .canReview(apt.getStatus() == AppointmentStatus.COMPLETED && !reviewRepository.existsByAppointmentId(apt.getId()))
                .build();
    }
}

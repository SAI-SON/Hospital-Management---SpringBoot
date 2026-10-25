package com.medibook.service;

import com.medibook.dto.CreateReviewRequest;
import com.medibook.dto.PageResponse;
import com.medibook.dto.ReviewDto;
import com.medibook.entity.*;
import com.medibook.exception.BadRequestException;
import com.medibook.exception.ConflictException;
import com.medibook.exception.ResourceNotFoundException;
import com.medibook.repository.AppointmentRepository;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.PatientRepository;
import com.medibook.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public ReviewDto submitReview(Long userId, Long appointmentId, CreateReviewRequest request) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Current user does not have a patient profile"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new BadRequestException("You can only review your own appointments");
        }

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Reviews can only be submitted for COMPLETED appointments");
        }

        if (reviewRepository.existsByAppointmentId(appointmentId)) {
            throw new ConflictException("A review has already been submitted for this appointment");
        }

        Doctor doctor = appointment.getDoctor();

        Review review = Review.builder()
                .appointment(appointment)
                .patient(patient)
                .doctor(doctor)
                .rating(request.getRating())
                .comment(request.getComment() != null ? request.getComment().trim() : null)
                .build();

        Review saved = reviewRepository.save(review);

        // Recalculate doctor rating and review counts
        Double avg = reviewRepository.calculateAverageRatingForDoctor(doctor.getId());
        long count = reviewRepository.countReviewsForDoctor(doctor.getId());

        doctor.setRatingAverage(BigDecimal.valueOf(avg != null ? avg : 0.0).setScale(2, RoundingMode.HALF_UP));
        doctor.setTotalReviews((int) count);
        doctorRepository.save(doctor);

        // Notify doctor
        notificationService.createNotification(
                doctor.getUser(),
                "New Patient Review",
                String.format("%s left you a %d-star review.", patient.getFullName(), request.getRating()),
                "REVIEW"
        );

        auditLogService.logAction(
                patient.getUser(),
                "SUBMIT_REVIEW",
                "Review",
                saved.getId().toString(),
                null,
                null,
                "Rated doctor " + doctor.getFullName() + " with " + request.getRating() + " stars"
        );

        log.info("Patient {} submitted review for Doctor {} (Rating: {})", patient.getFullName(), doctor.getFullName(), request.getRating());
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewDto> getDoctorReviews(Long doctorId, int page, int size) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        Page<Review> reviewPage = reviewRepository.findByDoctorOrderByCreatedAtDesc(
                doctor, PageRequest.of(page, size));

        List<ReviewDto> content = reviewPage.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PageResponse.<ReviewDto>builder()
                .content(content)
                .pageNumber(reviewPage.getNumber())
                .pageSize(reviewPage.getSize())
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .isLast(reviewPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewDto getReviewForAppointment(Long appointmentId) {
        return reviewRepository.findByAppointmentId(appointmentId)
                .map(this::mapToDto)
                .orElse(null);
    }

    private ReviewDto mapToDto(Review r) {
        return ReviewDto.builder()
                .id(r.getId())
                .appointmentId(r.getAppointment().getId())
                .patientId(r.getPatient().getId())
                .patientName(r.getPatient().getFullName())
                .patientAvatarUrl(r.getPatient().getAvatarUrl())
                .doctorId(r.getDoctor().getId())
                .doctorName(r.getDoctor().getFullName())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}

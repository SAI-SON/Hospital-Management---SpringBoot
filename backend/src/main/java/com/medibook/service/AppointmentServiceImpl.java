package com.medibook.service;

import com.medibook.dto.*;
import com.medibook.email.EmailService;
import com.medibook.entity.*;
import com.medibook.exception.*;
import com.medibook.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final SlotRepository slotRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final ReviewRepository reviewRepository;
    private final EmailService emailService;

    private static final ZoneId ZONE = ZoneId.systemDefault();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    @Override
    @Transactional
    public AppointmentResponseDto bookAppointment(Long patientUserId, BookAppointmentRequest request) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user id: " + patientUserId));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        if (!doctor.isApproved() || !doctor.isAvailable()) {
            throw new BadRequestException("This doctor is currently not accepting new appointments");
        }

        // CRITICAL CONCURRENCY CONTROL: Acquire pessimistic write lock on the slot
        Slot slot = slotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + request.getSlotId()));

        if (!slot.getDoctor().getId().equals(doctor.getId())) {
            throw new BadRequestException("The requested slot does not belong to the selected doctor");
        }

        // Return proper 409 Conflict if already booked
        if (slot.isBooked()) {
            throw new ConflictException("This appointment slot has just been booked by another patient. Please select another slot.");
        }

        Instant now = Instant.now();
        // Rule: No booking in the past
        if (slot.getSlotStart().isBefore(now)) {
            throw new BadRequestException("Cannot book appointment slots in the past");
        }

        // Rule: Max advance booking of 30 days
        if (slot.getSlotStart().isAfter(now.plus(Duration.ofDays(30)))) {
            throw new BadRequestException("Appointments cannot be booked more than 30 days in advance");
        }

        ZonedDateTime startZdt = slot.getSlotStart().atZone(ZONE);
        ZonedDateTime endZdt = slot.getSlotEnd().atZone(ZONE);
        LocalDate appointmentDate = startZdt.toLocalDate();
        LocalTime startTime = startZdt.toLocalTime();
        LocalTime endTime = endZdt.toLocalTime();

        // Rule: A patient cannot have two overlapping appointments
        boolean hasOverlap = appointmentRepository.existsOverlappingAppointmentForPatient(
                patient.getId(),
                appointmentDate,
                startTime,
                endTime,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED),
                null
        );

        if (hasOverlap) {
            throw new ConflictException("You already have an active appointment scheduled during this time window");
        }

        // Mark slot as booked
        slot.setBooked(true);
        slotRepository.save(slot);

        // Generate unique reference number (MB-YYYYMMDD-XXXX)
        String refDate = appointmentDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String refCode = UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        String referenceNo = "MB-" + refDate + "-" + refCode;

        Appointment appointment = Appointment.builder()
                .referenceNo(referenceNo)
                .patient(patient)
                .doctor(doctor)
                .slot(slot)
                .appointmentDate(appointmentDate)
                .startTime(startTime)
                .endTime(endTime)
                .status(AppointmentStatus.CONFIRMED)
                .reason(request.getReason().trim())
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // Dispatch async emails to both patient and doctor
        String formattedDateTime = appointmentDate.format(DATE_FORMATTER) + " at " + startTime.format(TIME_FORMATTER);
        emailService.sendBookingConfirmation(
                patient.getUser().getEmail(),
                patient.getFullName(),
                doctor.getFullName(),
                formattedDateTime,
                referenceNo
        );

        emailService.sendDoctorNewBookingAlert(
                doctor.getUser().getEmail(),
                doctor.getFullName(),
                patient.getFullName(),
                formattedDateTime,
                referenceNo
        );

        return toDto(saved);
    }

    @Override
    @Transactional
    public AppointmentResponseDto cancelAppointment(Long userId, Long appointmentId, CancelAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        boolean isPatient = appointment.getPatient().getUser().getId().equals(userId);
        boolean isDoctor = appointment.getDoctor().getUser().getId().equals(userId);

        if (!isPatient && !isDoctor) {
            throw new BadRequestException("You do not have authorization to cancel this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("This appointment is already cancelled");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Completed appointments cannot be cancelled");
        }

        // Rule: Cancellation allowed only up to 2 hours before appointment time
        Instant cancellationDeadline = appointment.getSlot().getSlotStart().minus(Duration.ofHours(2));
        if (Instant.now().isAfter(cancellationDeadline)) {
            throw new BadRequestException("Cancellation is only permitted up to 2 hours before the scheduled appointment time");
        }

        // Release slot back to available
        Slot slot = appointment.getSlot();
        slot.setBooked(false);
        slotRepository.save(slot);

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(request.getReason().trim());
        appointment.setCancelledAt(Instant.now());
        Appointment saved = appointmentRepository.save(appointment);

        String formattedDateTime = appointment.getAppointmentDate().format(DATE_FORMATTER) + " at " +
                appointment.getStartTime().format(TIME_FORMATTER);

        if (isPatient) {
            emailService.sendAppointmentCancellation(
                    appointment.getDoctor().getUser().getEmail(),
                    appointment.getDoctor().getFullName(),
                    appointment.getPatient().getFullName(),
                    formattedDateTime,
                    request.getReason()
            );
        } else {
            emailService.sendAppointmentCancellation(
                    appointment.getPatient().getUser().getEmail(),
                    appointment.getPatient().getFullName(),
                    appointment.getDoctor().getFullName(),
                    formattedDateTime,
                    request.getReason()
            );
        }

        return toDto(saved);
    }

    @Override
    @Transactional
    public AppointmentResponseDto rescheduleAppointment(Long patientUserId, Long appointmentId, RescheduleAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        if (!appointment.getPatient().getUser().getId().equals(patientUserId)) {
            throw new BadRequestException("You do not have authorization to reschedule this appointment");
        }

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED && appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new BadRequestException("Only confirmed or pending appointments can be rescheduled");
        }

        // Check 2-hour deadline on current appointment
        Instant deadline = appointment.getSlot().getSlotStart().minus(Duration.ofHours(2));
        if (Instant.now().isAfter(deadline)) {
            throw new BadRequestException("Rescheduling is only permitted up to 2 hours before the scheduled appointment time");
        }

        // Lock new slot with pessimistic lock
        Slot newSlot = slotRepository.findByIdWithLock(request.getNewSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("New slot not found with id: " + request.getNewSlotId()));

        if (!newSlot.getDoctor().getId().equals(appointment.getDoctor().getId())) {
            throw new BadRequestException("The new slot must belong to the same doctor");
        }

        if (newSlot.isBooked()) {
            throw new ConflictException("The selected new slot has already been booked. Please pick another.");
        }

        if (newSlot.getSlotStart().isBefore(Instant.now())) {
            throw new BadRequestException("Cannot reschedule to a past slot");
        }

        ZonedDateTime newStartZdt = newSlot.getSlotStart().atZone(ZONE);
        ZonedDateTime newEndZdt = newSlot.getSlotEnd().atZone(ZONE);
        LocalDate newDate = newStartZdt.toLocalDate();
        LocalTime newStartTime = newStartZdt.toLocalTime();
        LocalTime newEndTime = newEndZdt.toLocalTime();

        // Check patient overlap (excluding current appointment)
        boolean hasOverlap = appointmentRepository.existsOverlappingAppointmentForPatient(
                appointment.getPatient().getId(),
                newDate,
                newStartTime,
                newEndTime,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED),
                appointment.getId()
        );

        if (hasOverlap) {
            throw new ConflictException("You already have another active appointment scheduled during the new time window");
        }

        // Free old slot
        Slot oldSlot = appointment.getSlot();
        oldSlot.setBooked(false);
        slotRepository.save(oldSlot);

        // Reserve new slot
        newSlot.setBooked(true);
        slotRepository.save(newSlot);

        appointment.setSlot(newSlot);
        appointment.setAppointmentDate(newDate);
        appointment.setStartTime(newStartTime);
        appointment.setEndTime(newEndTime);
        if (request.getReason() != null && !request.getReason().isBlank()) {
            appointment.setReason(appointment.getReason() + " [Rescheduled: " + request.getReason().trim() + "]");
        }

        Appointment saved = appointmentRepository.save(appointment);

        String newFormatted = newDate.format(DATE_FORMATTER) + " at " + newStartTime.format(TIME_FORMATTER);
        emailService.sendAppointmentReschedule(
                appointment.getPatient().getUser().getEmail(),
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getFullName(),
                newFormatted,
                appointment.getReferenceNo()
        );

        emailService.sendAppointmentReschedule(
                appointment.getDoctor().getUser().getEmail(),
                appointment.getDoctor().getFullName(),
                appointment.getPatient().getFullName(),
                newFormatted,
                appointment.getReferenceNo()
        );

        return toDto(saved);
    }

    @Override
    @Transactional
    public AppointmentResponseDto doctorUpdateStatus(Long doctorUserId, Long appointmentId, AppointmentStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        if (!appointment.getDoctor().getUser().getId().equals(doctorUserId)) {
            throw new BadRequestException("You do not have authorization to manage this appointment");
        }

        appointment.setStatus(newStatus);
        Appointment saved = appointmentRepository.save(appointment);

        // If completed: request a review from patient
        if (newStatus == AppointmentStatus.COMPLETED) {
            emailService.sendReviewRequest(
                    appointment.getPatient().getUser().getEmail(),
                    appointment.getPatient().getFullName(),
                    appointment.getDoctor().getFullName(),
                    appointment.getId()
            );
        }

        return toDto(saved);
    }

    @Override
    @Transactional
    public AppointmentResponseDto doctorAddConsultationNotes(Long doctorUserId, Long appointmentId, ConsultationNotesRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        if (!appointment.getDoctor().getUser().getId().equals(doctorUserId)) {
            throw new BadRequestException("You do not have authorization to update notes for this appointment");
        }

        appointment.setConsultationNotes(request.getNotes().trim());
        return toDto(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AppointmentResponseDto> getPatientAppointments(Long patientUserId, AppointmentStatus status, int page, int size) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user id: " + patientUserId));

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Appointment> appointmentPage = appointmentRepository.findByPatientIdAndStatus(patient.getId(), status, pageable);

        return PageResponse.from(appointmentPage.map(this::toDto));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AppointmentResponseDto> getDoctorAppointments(Long doctorUserId, LocalDate date, AppointmentStatus status, int page, int size) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user id: " + doctorUserId));

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Appointment> appointmentPage = appointmentRepository.findByDoctorIdAndFilters(doctor.getId(), date, status, pageable);

        return PageResponse.from(appointmentPage.map(this::toDto));
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDto getAppointmentById(Long userId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        boolean isPatient = appointment.getPatient().getUser().getId().equals(userId);
        boolean isDoctor = appointment.getDoctor().getUser().getId().equals(userId);

        if (!isPatient && !isDoctor) {
            throw new BadRequestException("You do not have access to this appointment");
        }

        return toDto(appointment);
    }

    private AppointmentResponseDto toDto(Appointment apt) {
        Instant now = Instant.now();
        Instant deadline = apt.getSlot().getSlotStart().minus(Duration.ofHours(2));
        boolean withinCancelWindow = now.isBefore(deadline);

        boolean canCancel = withinCancelWindow &&
                (apt.getStatus() == AppointmentStatus.PENDING || apt.getStatus() == AppointmentStatus.CONFIRMED);

        boolean canReschedule = withinCancelWindow &&
                (apt.getStatus() == AppointmentStatus.PENDING || apt.getStatus() == AppointmentStatus.CONFIRMED);

        boolean canReview = apt.getStatus() == AppointmentStatus.COMPLETED &&
                !reviewRepository.existsByAppointmentId(apt.getId());

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
                .canCancel(canCancel)
                .canReschedule(canReschedule)
                .canReview(canReview)
                .build();
    }
}

package com.medibook.service;

import com.medibook.dto.BookAppointmentRequest;
import com.medibook.dto.CancelAppointmentRequest;
import com.medibook.email.EmailService;
import com.medibook.entity.*;
import com.medibook.exception.BadRequestException;
import com.medibook.exception.ConflictException;
import com.medibook.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private SlotRepository slotRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private User patientUser;
    private User doctorUser;
    private Patient patient;
    private Doctor doctor;
    private Slot slot;

    @BeforeEach
    void setUp() {
        patientUser = User.builder().id(100L).email("patient@medibook.com").build();
        doctorUser = User.builder().id(200L).email("doctor@medibook.com").build();

        patient = Patient.builder()
                .id(1L)
                .user(patientUser)
                .fullName("John Doe")
                .phoneNumber("9876543210")
                .build();

        Specialization spec = Specialization.builder()
                .id(1L)
                .name("Cardiology")
                .build();

        doctor = Doctor.builder()
                .id(1L)
                .user(doctorUser)
                .fullName("Dr. Sarah Jenkins")
                .specialization(spec)
                .consultationFee(BigDecimal.valueOf(150.00))
                .isApproved(true)
                .isAvailable(true)
                .build();

        Instant slotStart = Instant.now().plus(Duration.ofDays(2));
        Instant slotEnd = slotStart.plus(Duration.ofMinutes(30));

        slot = Slot.builder()
                .id(50L)
                .doctor(doctor)
                .slotStart(slotStart)
                .slotEnd(slotEnd)
                .isBooked(false)
                .version(0L)
                .build();
    }

    @Test
    @DisplayName("Booking: Success books appointment and sets slot.isBooked = true")
    void testBookAppointment_Success() {
        BookAppointmentRequest request = BookAppointmentRequest.builder()
                .doctorId(1L)
                .slotId(50L)
                .reason("Annual cardiac checkup")
                .build();

        when(patientRepository.findByUserId(100L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(slotRepository.findByIdWithLock(50L)).thenReturn(Optional.of(slot));
        when(appointmentRepository.existsOverlappingAppointmentForPatient(eq(1L), any(), any(), any(), any(), isNull()))
                .thenReturn(false);
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(i -> {
            Appointment a = i.getArgument(0);
            a.setId(1001L);
            return a;
        });

        var response = appointmentService.bookAppointment(100L, request);

        assertNotNull(response);
        assertTrue(slot.isBooked());
        verify(slotRepository, times(1)).save(slot);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
        verify(emailService, times(1)).sendBookingConfirmation(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Booking: Throws ConflictException (409) if slot is already booked")
    void testBookAppointment_DoubleBooking_ThrowsConflict() {
        slot.setBooked(true); // Already booked!

        BookAppointmentRequest request = BookAppointmentRequest.builder()
                .doctorId(1L)
                .slotId(50L)
                .reason("Checkup")
                .build();

        when(patientRepository.findByUserId(100L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(slotRepository.findByIdWithLock(50L)).thenReturn(Optional.of(slot));

        assertThrows(ConflictException.class, () -> appointmentService.bookAppointment(100L, request));
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Booking: Throws ConflictException if patient has overlapping appointment")
    void testBookAppointment_PatientOverlap_ThrowsConflict() {
        BookAppointmentRequest request = BookAppointmentRequest.builder()
                .doctorId(1L)
                .slotId(50L)
                .reason("Consultation")
                .build();

        when(patientRepository.findByUserId(100L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(slotRepository.findByIdWithLock(50L)).thenReturn(Optional.of(slot));
        when(appointmentRepository.existsOverlappingAppointmentForPatient(eq(1L), any(), any(), any(), any(), isNull()))
                .thenReturn(true); // Overlapping!

        assertThrows(ConflictException.class, () -> appointmentService.bookAppointment(100L, request));
        assertFalse(slot.isBooked());
    }

    @Test
    @DisplayName("Cancellation: Releases slot back to available pool within allowed window")
    void testCancelAppointment_ReleasesSlot() {
        slot.setBooked(true);
        Appointment appointment = Appointment.builder()
                .id(1001L)
                .referenceNo("MB-20261026-TEST")
                .patient(patient)
                .doctor(doctor)
                .slot(slot)
                .appointmentDate(LocalDate.now().plusDays(2))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .status(AppointmentStatus.CONFIRMED)
                .build();

        when(appointmentRepository.findById(1001L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(i -> i.getArgument(0));

        CancelAppointmentRequest request = CancelAppointmentRequest.builder()
                .reason("Personal emergency")
                .build();

        var response = appointmentService.cancelAppointment(100L, 1001L, request);

        assertEquals("CANCELLED", response.getStatus());
        assertFalse(slot.isBooked()); // Crucial: Slot is released!
        verify(slotRepository, times(1)).save(slot);
        verify(emailService, times(1)).sendAppointmentCancellation(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Cancellation: Throws BadRequestException when within 2-hour deadline")
    void testCancelAppointment_WithinTwoHours_ThrowsBadRequest() {
        // Slot is in 1 hour (less than 2 hours away)
        slot.setSlotStart(Instant.now().plus(Duration.ofMinutes(60)));
        slot.setBooked(true);

        Appointment appointment = Appointment.builder()
                .id(1001L)
                .patient(patient)
                .doctor(doctor)
                .slot(slot)
                .status(AppointmentStatus.CONFIRMED)
                .build();

        when(appointmentRepository.findById(1001L)).thenReturn(Optional.of(appointment));

        CancelAppointmentRequest request = CancelAppointmentRequest.builder()
                .reason("Too late")
                .build();

        assertThrows(BadRequestException.class, () -> appointmentService.cancelAppointment(100L, 1001L, request));
        assertTrue(slot.isBooked()); // Remains booked
    }
}

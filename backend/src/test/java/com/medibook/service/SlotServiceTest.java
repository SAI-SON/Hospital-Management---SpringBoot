package com.medibook.service;

import com.medibook.dto.GenerateSlotsRequest;
import com.medibook.entity.*;
import com.medibook.exception.BadRequestException;
import com.medibook.repository.DoctorAvailabilityRepository;
import com.medibook.repository.DoctorLeaveRepository;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.SlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SlotServiceTest {

    @Mock
    private SlotRepository slotRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private DoctorAvailabilityRepository availabilityRepository;
    @Mock
    private DoctorLeaveRepository leaveRepository;

    @InjectMocks
    private SlotServiceImpl slotService;

    private Doctor doctor;

    @BeforeEach
    void setUp() {
        doctor = Doctor.builder()
                .id(1L)
                .fullName("Dr. Gregory House")
                .isApproved(true)
                .isAvailable(true)
                .build();
    }

    @Test
    @DisplayName("Generate Slots: Excludes leave days")
    void testGenerateSlots_LeaveDay_GeneratesZero() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        GenerateSlotsRequest request = GenerateSlotsRequest.builder()
                .startDate(tomorrow)
                .endDate(tomorrow)
                .build();

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(leaveRepository.existsByDoctorAndLeaveDate(doctor, tomorrow)).thenReturn(true);

        int count = slotService.generateSlots(1L, request);

        assertEquals(0, count);
        verify(slotRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("Generate Slots: Throws BadRequestException when advance booking exceeds 30 days")
    void testGenerateSlots_Exceeds30Days_ThrowsBadRequest() {
        LocalDate distantFuture = LocalDate.now().plusDays(35);
        GenerateSlotsRequest request = GenerateSlotsRequest.builder()
                .startDate(LocalDate.now().plusDays(1))
                .endDate(distantFuture)
                .build();

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));

        assertThrows(BadRequestException.class, () -> slotService.generateSlots(1L, request));
    }

    @Test
    @DisplayName("Generate Slots: Correctly splits hours into slots and excludes break")
    void testGenerateSlots_NormalDay_GeneratesCorrectSlots() {
        LocalDate targetDate = LocalDate.now().plusDays(2);
        int dayOfWeek = targetDate.getDayOfWeek().getValue();

        GenerateSlotsRequest request = GenerateSlotsRequest.builder()
                .startDate(targetDate)
                .endDate(targetDate)
                .build();

        // 9:00 to 11:00 (30 min slots = 4 slots: 9:00, 9:30, 10:00, 10:30), but 10:00-10:30 is break -> 3 slots
        DoctorAvailability avail = DoctorAvailability.builder()
                .doctor(doctor)
                .dayOfWeek(dayOfWeek)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(11, 0))
                .slotDurationMinutes(30)
                .breakStartTime(LocalTime.of(10, 0))
                .breakEndTime(LocalTime.of(10, 30))
                .isActive(true)
                .build();

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(leaveRepository.existsByDoctorAndLeaveDate(doctor, targetDate)).thenReturn(false);
        when(availabilityRepository.findByDoctorAndDayOfWeek(doctor, dayOfWeek)).thenReturn(Optional.of(avail));
        when(slotRepository.existsByDoctorAndSlotStart(eq(doctor), any())).thenReturn(false);

        int count = slotService.generateSlots(1L, request);

        // Expect 3 slots (9:00-9:30, 9:30-10:00, 10:30-11:00)
        assertEquals(3, count);
        verify(slotRepository, times(1)).saveAll(anyList());
    }
}

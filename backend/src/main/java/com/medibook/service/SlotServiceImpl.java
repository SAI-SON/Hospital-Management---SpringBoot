package com.medibook.service;

import com.medibook.dto.GenerateSlotsRequest;
import com.medibook.dto.SlotDto;
import com.medibook.entity.Doctor;
import com.medibook.entity.DoctorAvailability;
import com.medibook.entity.Slot;
import com.medibook.exception.BadRequestException;
import com.medibook.exception.ResourceNotFoundException;
import com.medibook.repository.DoctorAvailabilityRepository;
import com.medibook.repository.DoctorLeaveRepository;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorLeaveRepository leaveRepository;

    private static final int MAX_ADVANCE_DAYS = 30;
    private static final ZoneId ZONE = ZoneId.systemDefault();

    @Override
    @Transactional
    public int generateSlots(Long doctorId, GenerateSlotsRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();
        LocalDate today = LocalDate.now();
        LocalDate maxDate = today.plusDays(MAX_ADVANCE_DAYS);

        if (startDate.isBefore(today)) {
            throw new BadRequestException("Cannot generate slots for past dates");
        }

        if (endDate.isAfter(maxDate)) {
            throw new BadRequestException("Slots can only be generated up to " + MAX_ADVANCE_DAYS + " days in advance");
        }

        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be prior to start date");
        }

        List<Slot> slotsToSave = new ArrayList<>();
        Instant now = Instant.now();

        LocalDate curr = startDate;
        while (!curr.isAfter(endDate)) {
            // Check if doctor has registered leave on this date
            if (leaveRepository.existsByDoctorAndLeaveDate(doctor, curr)) {
                log.info("Doctor {} is on leave on {}. Skipping slot generation.", doctorId, curr);
                curr = curr.plusDays(1);
                continue;
            }

            // Convert day of week (Java DayOfWeek: 1=Mon ... 7=Sun)
            int dayOfWeekValue = curr.getDayOfWeek().getValue();

            var availabilityOpt = availabilityRepository.findByDoctorAndDayOfWeek(doctor, dayOfWeekValue);
            if (availabilityOpt.isEmpty() || !availabilityOpt.get().isActive()) {
                curr = curr.plusDays(1);
                continue;
            }

            DoctorAvailability avail = availabilityOpt.get();
            int slotDuration = avail.getSlotDurationMinutes() > 0 ? avail.getSlotDurationMinutes() : 30;

            LocalTime slotTime = avail.getStartTime();
            LocalTime closingTime = avail.getEndTime();

            while (true) {
                LocalTime slotEndTime = slotTime.plusMinutes(slotDuration);
                if (slotEndTime.isAfter(closingTime)) {
                    break;
                }

                // Check break time exclusion
                if (avail.getBreakStartTime() != null && avail.getBreakEndTime() != null) {
                    boolean overlapsBreak = !(slotEndTime.compareTo(avail.getBreakStartTime()) <= 0 ||
                            slotTime.compareTo(avail.getBreakEndTime()) >= 0);
                    if (overlapsBreak) {
                        slotTime = slotEndTime;
                        continue;
                    }
                }

                Instant slotStartInstant = curr.atTime(slotTime).atZone(ZONE).toInstant();
                Instant slotEndInstant = curr.atTime(slotEndTime).atZone(ZONE).toInstant();

                // Skip past slots for today
                if (slotStartInstant.isAfter(now)) {
                    // Check if already generated (Idempotency)
                    if (!slotRepository.existsByDoctorAndSlotStart(doctor, slotStartInstant)) {
                        Slot slot = Slot.builder()
                                .doctor(doctor)
                                .slotStart(slotStartInstant)
                                .slotEnd(slotEndInstant)
                                .isBooked(false)
                                .version(0L)
                                .build();
                        slotsToSave.add(slot);
                    }
                }

                slotTime = slotEndTime;
            }

            curr = curr.plusDays(1);
        }

        if (!slotsToSave.isEmpty()) {
            slotRepository.saveAll(slotsToSave);
            log.info("Generated {} new slots for doctor id {}", slotsToSave.size(), doctorId);
        }

        return slotsToSave.size();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotDto> getAvailableSlotsByDoctorAndDate(Long doctorId, LocalDate date) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor not found with id: " + doctorId);
        }

        Instant startRange = date.atStartOfDay(ZONE).toInstant();
        Instant endRange = date.atTime(LocalTime.MAX).atZone(ZONE).toInstant();
        Instant now = Instant.now();

        // Effective start is max of (startOfDay, now) to prevent booking past slots
        Instant effectiveStart = startRange.isBefore(now) ? now : startRange;

        return slotRepository.findAvailableSlotsByDoctorAndRange(doctorId, effectiveStart, endRange)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotDto> getAllSlotsByDoctorAndDate(Long doctorId, LocalDate date) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor not found with id: " + doctorId);
        }

        Instant startRange = date.atStartOfDay(ZONE).toInstant();
        Instant endRange = date.atTime(LocalTime.MAX).atZone(ZONE).toInstant();

        return slotRepository.findSlotsByDoctorAndRange(doctorId, startRange, endRange)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private SlotDto toDto(Slot slot) {
        return SlotDto.builder()
                .id(slot.getId())
                .doctorId(slot.getDoctor().getId())
                .slotStart(slot.getSlotStart())
                .slotEnd(slot.getSlotEnd())
                .isBooked(slot.isBooked())
                .build();
    }
}

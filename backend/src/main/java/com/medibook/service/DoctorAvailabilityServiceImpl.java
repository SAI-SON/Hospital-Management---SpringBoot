package com.medibook.service;

import com.medibook.dto.CreateLeaveRequest;
import com.medibook.dto.DoctorAvailabilityDto;
import com.medibook.dto.DoctorLeaveDto;
import com.medibook.entity.Doctor;
import com.medibook.entity.DoctorAvailability;
import com.medibook.entity.DoctorLeave;
import com.medibook.exception.BadRequestException;
import com.medibook.exception.ConflictException;
import com.medibook.exception.ResourceNotFoundException;
import com.medibook.repository.DoctorAvailabilityRepository;
import com.medibook.repository.DoctorLeaveRepository;
import com.medibook.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityServiceImpl implements DoctorAvailabilityService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorLeaveRepository leaveRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DoctorAvailabilityDto> getDoctorAvailability(Long doctorId) {
        Doctor doctor = getDoctor(doctorId);
        return availabilityRepository.findByDoctorOrderByDayOfWeekAsc(doctor)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public List<DoctorAvailabilityDto> setWeeklyAvailability(Long doctorId, List<DoctorAvailabilityDto> availabilityList) {
        Doctor doctor = getDoctor(doctorId);

        // Validate time boundaries
        for (DoctorAvailabilityDto dto : availabilityList) {
            if (dto.getStartTime().isAfter(dto.getEndTime())) {
                throw new BadRequestException("Start time cannot be after end time for day " + dto.getDayOfWeek());
            }
            if (dto.getBreakStartTime() != null && dto.getBreakEndTime() != null) {
                if (dto.getBreakStartTime().isAfter(dto.getBreakEndTime())) {
                    throw new BadRequestException("Break start time cannot be after break end time for day " + dto.getDayOfWeek());
                }
                if (dto.getBreakStartTime().isBefore(dto.getStartTime()) || dto.getBreakEndTime().isAfter(dto.getEndTime())) {
                    throw new BadRequestException("Break hours must fall within working hours for day " + dto.getDayOfWeek());
                }
            }
        }

        // Delete previous configurations and replace atomically
        availabilityRepository.deleteByDoctor(doctor);

        List<DoctorAvailability> savedEntities = new ArrayList<>();
        for (DoctorAvailabilityDto dto : availabilityList) {
            DoctorAvailability avail = DoctorAvailability.builder()
                    .doctor(doctor)
                    .dayOfWeek(dto.getDayOfWeek())
                    .startTime(dto.getStartTime())
                    .endTime(dto.getEndTime())
                    .slotDurationMinutes(dto.getSlotDurationMinutes() > 0 ? dto.getSlotDurationMinutes() : 30)
                    .breakStartTime(dto.getBreakStartTime())
                    .breakEndTime(dto.getBreakEndTime())
                    .isActive(dto.isActive())
                    .build();

            savedEntities.add(availabilityRepository.save(avail));
        }

        return savedEntities.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorLeaveDto> getDoctorLeaves(Long doctorId) {
        Doctor doctor = getDoctor(doctorId);
        return leaveRepository.findByDoctorAndLeaveDateGreaterThanEqualOrderByLeaveDateAsc(doctor, LocalDate.now())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public DoctorLeaveDto addDoctorLeave(Long doctorId, CreateLeaveRequest request) {
        Doctor doctor = getDoctor(doctorId);

        if (leaveRepository.existsByDoctorAndLeaveDate(doctor, request.getLeaveDate())) {
            throw new ConflictException("A leave record already exists for " + request.getLeaveDate());
        }

        DoctorLeave leave = DoctorLeave.builder()
                .doctor(doctor)
                .leaveDate(request.getLeaveDate())
                .reason(request.getReason())
                .build();

        return toDto(leaveRepository.save(leave));
    }

    @Override
    @Transactional
    public void cancelDoctorLeave(Long doctorId, Long leaveId) {
        Doctor doctor = getDoctor(doctorId);
        DoctorLeave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave record not found with id: " + leaveId));

        if (!leave.getDoctor().getId().equals(doctor.getId())) {
            throw new BadRequestException("You are not authorized to cancel this leave record");
        }

        leaveRepository.delete(leave);
    }

    private Doctor getDoctor(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
    }

    private DoctorAvailabilityDto toDto(DoctorAvailability avail) {
        return DoctorAvailabilityDto.builder()
                .id(avail.getId())
                .dayOfWeek(avail.getDayOfWeek())
                .startTime(avail.getStartTime())
                .endTime(avail.getEndTime())
                .slotDurationMinutes(avail.getSlotDurationMinutes())
                .breakStartTime(avail.getBreakStartTime())
                .breakEndTime(avail.getBreakEndTime())
                .isActive(avail.isActive())
                .build();
    }

    private DoctorLeaveDto toDto(DoctorLeave leave) {
        return DoctorLeaveDto.builder()
                .id(leave.getId())
                .doctorId(leave.getDoctor().getId())
                .leaveDate(leave.getLeaveDate())
                .reason(leave.getReason())
                .build();
    }
}

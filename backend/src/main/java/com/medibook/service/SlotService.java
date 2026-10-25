package com.medibook.service;

import com.medibook.dto.GenerateSlotsRequest;
import com.medibook.dto.SlotDto;

import java.time.LocalDate;
import java.util.List;

public interface SlotService {
    int generateSlots(Long doctorId, GenerateSlotsRequest request);
    List<SlotDto> getAvailableSlotsByDoctorAndDate(Long doctorId, LocalDate date);
    List<SlotDto> getAllSlotsByDoctorAndDate(Long doctorId, LocalDate date);
}

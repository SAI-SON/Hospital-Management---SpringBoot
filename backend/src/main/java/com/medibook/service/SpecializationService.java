package com.medibook.service;

import com.medibook.dto.SpecializationDto;

import java.util.List;

public interface SpecializationService {
    List<SpecializationDto> getAllActiveSpecializations();
    SpecializationDto getSpecializationById(Long id);
    SpecializationDto createSpecialization(SpecializationDto dto);
    SpecializationDto updateSpecialization(Long id, SpecializationDto dto);
}

package com.medibook.service;

import com.medibook.dto.SpecializationDto;
import com.medibook.entity.Specialization;
import com.medibook.exception.ConflictException;
import com.medibook.exception.ResourceNotFoundException;
import com.medibook.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpecializationServiceImpl implements SpecializationService {

    private final SpecializationRepository specializationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SpecializationDto> getAllActiveSpecializations() {
        return specializationRepository.findAllByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SpecializationDto getSpecializationById(Long id) {
        Specialization spec = specializationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found with id: " + id));
        return toDto(spec);
    }

    @Override
    @Transactional
    public SpecializationDto createSpecialization(SpecializationDto dto) {
        if (specializationRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new ConflictException("Specialization with name '" + dto.getName() + "' already exists");
        }

        Specialization spec = Specialization.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .iconName(dto.getIconName())
                .isActive(dto.isActive())
                .build();

        return toDto(specializationRepository.save(spec));
    }

    @Override
    @Transactional
    public SpecializationDto updateSpecialization(Long id, SpecializationDto dto) {
        Specialization spec = specializationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found with id: " + id));

        if (!spec.getName().equalsIgnoreCase(dto.getName().trim()) &&
                specializationRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new ConflictException("Specialization with name '" + dto.getName() + "' already exists");
        }

        spec.setName(dto.getName().trim());
        spec.setDescription(dto.getDescription());
        spec.setIconName(dto.getIconName());
        spec.setActive(dto.isActive());

        return toDto(specializationRepository.save(spec));
    }

    private SpecializationDto toDto(Specialization spec) {
        return SpecializationDto.builder()
                .id(spec.getId())
                .name(spec.getName())
                .description(spec.getDescription())
                .iconName(spec.getIconName())
                .isActive(spec.isActive())
                .build();
    }
}

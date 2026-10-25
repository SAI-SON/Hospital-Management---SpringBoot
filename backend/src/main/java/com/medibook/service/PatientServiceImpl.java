package com.medibook.service;

import com.medibook.dto.PatientProfileDto;
import com.medibook.dto.PatientUpdateRequest;
import com.medibook.entity.Patient;
import com.medibook.exception.ResourceNotFoundException;
import com.medibook.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    @Override
    @Transactional(readOnly = true)
    public PatientProfileDto getPatientProfile(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user id: " + userId));

        return toDto(patient);
    }

    @Override
    @Transactional
    public PatientProfileDto updatePatientProfile(Long userId, PatientUpdateRequest request) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user id: " + userId));

        patient.setFullName(request.getFullName().trim());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setEmergencyContact(request.getEmergencyContact());
        patient.setAddress(request.getAddress());
        if (request.getAvatarUrl() != null) {
            patient.setAvatarUrl(request.getAvatarUrl());
        }

        Patient saved = patientRepository.save(patient);
        return toDto(saved);
    }

    private PatientProfileDto toDto(Patient patient) {
        Integer age = null;
        if (patient.getDateOfBirth() != null) {
            age = Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears();
        }

        return PatientProfileDto.builder()
                .id(patient.getId())
                .userId(patient.getUser().getId())
                .email(patient.getUser().getEmail())
                .fullName(patient.getFullName())
                .phoneNumber(patient.getPhoneNumber())
                .dateOfBirth(patient.getDateOfBirth())
                .age(age)
                .gender(patient.getGender())
                .bloodGroup(patient.getBloodGroup())
                .emergencyContact(patient.getEmergencyContact())
                .address(patient.getAddress())
                .avatarUrl(patient.getAvatarUrl())
                .build();
    }
}

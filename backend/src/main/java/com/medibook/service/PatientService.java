package com.medibook.service;

import com.medibook.dto.PatientProfileDto;
import com.medibook.dto.PatientUpdateRequest;

public interface PatientService {
    PatientProfileDto getPatientProfile(Long userId);
    PatientProfileDto updatePatientProfile(Long userId, PatientUpdateRequest request);
}

package com.medibook.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientUpdateRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String emergencyContact;
    private String address;
    private String avatarUrl;
}

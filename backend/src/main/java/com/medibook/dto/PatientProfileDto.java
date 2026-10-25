package com.medibook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileDto {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private Integer age;
    private String gender;
    private String bloodGroup;
    private String emergencyContact;
    private String address;
    private String avatarUrl;
}

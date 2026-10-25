package com.medibook.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorUpdateRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Specialization is required")
    private Long specializationId;

    @Min(value = 0, message = "Years of experience cannot be negative")
    private int yearsOfExperience;

    @NotNull(message = "Consultation fee is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Consultation fee must be non-negative")
    private BigDecimal consultationFee;

    private String bio;
    private String clinicAddress;
    private String clinicCity;
    private String phoneNumber;
    private String avatarUrl;
    private Boolean isAvailable;
}

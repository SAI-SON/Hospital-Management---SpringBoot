package com.medibook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDetailDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String licenseNumber;
    private SpecializationDto specialization;
    private int yearsOfExperience;
    private BigDecimal consultationFee;
    private String bio;
    private String clinicAddress;
    private String clinicCity;
    private String phoneNumber;
    private String avatarUrl;
    private BigDecimal ratingAverage;
    private int totalReviews;
    private boolean isAvailable;
    private boolean isApproved;
    private List<DoctorAvailabilityDto> weeklyAvailability;
}

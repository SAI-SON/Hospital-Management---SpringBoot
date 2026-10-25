package com.medibook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSummaryDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String specializationName;
    private Long specializationId;
    private int yearsOfExperience;
    private BigDecimal consultationFee;
    private String clinicCity;
    private String clinicAddress;
    private String avatarUrl;
    private BigDecimal ratingAverage;
    private int totalReviews;
    private boolean isAvailable;
    private boolean isApproved;
}

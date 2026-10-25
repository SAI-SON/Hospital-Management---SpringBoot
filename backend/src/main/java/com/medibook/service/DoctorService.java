package com.medibook.service;

import com.medibook.dto.DoctorDetailDto;
import com.medibook.dto.DoctorSummaryDto;
import com.medibook.dto.DoctorUpdateRequest;
import com.medibook.dto.PageResponse;

import java.math.BigDecimal;

public interface DoctorService {
    PageResponse<DoctorSummaryDto> searchDoctors(
            String search,
            Long specializationId,
            String city,
            BigDecimal minFee,
            BigDecimal maxFee,
            Boolean availableOnly,
            BigDecimal minRating,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    DoctorDetailDto getDoctorById(Long id);
    DoctorDetailDto getDoctorByUserId(Long userId);
    DoctorDetailDto updateDoctorProfile(Long doctorId, DoctorUpdateRequest request);
    void approveDoctor(Long doctorId, boolean isApproved);
}

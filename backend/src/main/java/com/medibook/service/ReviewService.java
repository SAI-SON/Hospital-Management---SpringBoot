package com.medibook.service;

import com.medibook.dto.CreateReviewRequest;
import com.medibook.dto.PageResponse;
import com.medibook.dto.ReviewDto;

public interface ReviewService {
    ReviewDto submitReview(Long userId, Long appointmentId, CreateReviewRequest request);
    PageResponse<ReviewDto> getDoctorReviews(Long doctorId, int page, int size);
    ReviewDto getReviewForAppointment(Long appointmentId);
}

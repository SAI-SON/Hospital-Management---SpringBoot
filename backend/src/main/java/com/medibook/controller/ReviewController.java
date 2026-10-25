package com.medibook.controller;

import com.medibook.dto.ApiResponse;
import com.medibook.dto.CreateReviewRequest;
import com.medibook.dto.PageResponse;
import com.medibook.dto.ReviewDto;
import com.medibook.security.UserPrincipal;
import com.medibook.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Endpoints for viewing and submitting patient reviews for completed appointments")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/patient/appointments/{id}/reviews")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Submit review and rating for completed appointment")
    public ResponseEntity<ApiResponse<ReviewDto>> submitReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        ReviewDto review = reviewService.submitReview(principal.getId(), id, request);
        return new ResponseEntity<>(ApiResponse.success("Review submitted successfully!", review), HttpStatus.CREATED);
    }

    @GetMapping("/patient/appointments/{id}/review")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get review for an appointment if it exists")
    public ResponseEntity<ApiResponse<ReviewDto>> getReviewForAppointment(@PathVariable Long id) {
        ReviewDto review = reviewService.getReviewForAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Review retrieved", review));
    }

    @GetMapping("/reviews/doctor/{doctorId}")
    @Operation(summary = "Get public reviews and ratings for a doctor")
    public ResponseEntity<ApiResponse<PageResponse<ReviewDto>>> getDoctorReviews(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<ReviewDto> reviews = reviewService.getDoctorReviews(doctorId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Doctor reviews retrieved successfully", reviews));
    }
}

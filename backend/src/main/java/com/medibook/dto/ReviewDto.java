package com.medibook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private String patientAvatarUrl;
    private Long doctorId;
    private String doctorName;
    private int rating;
    private String comment;
    private Instant createdAt;
}

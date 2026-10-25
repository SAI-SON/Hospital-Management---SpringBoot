package com.medibook.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDto {
    private Long id;
    private String referenceNo;
    private Long patientId;
    private String patientName;
    private String patientPhone;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private BigDecimal doctorFee;
    private String doctorAvatarUrl;
    private String clinicCity;
    private String clinicAddress;
    private Long slotId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate appointmentDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private String status;
    private String reason;
    private String consultationNotes;
    private String cancellationReason;
    private Instant cancelledAt;
    private Instant createdAt;
    private boolean canCancel;
    private boolean canReschedule;
    private boolean canReview;
}

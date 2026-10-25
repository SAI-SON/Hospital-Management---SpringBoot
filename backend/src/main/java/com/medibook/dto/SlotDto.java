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
public class SlotDto {
    private Long id;
    private Long doctorId;
    private Instant slotStart;
    private Instant slotEnd;
    private String startTime;
    private String endTime;
    private boolean isBooked;
}

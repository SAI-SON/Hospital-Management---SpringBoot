package com.medibook.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleAppointmentRequest {

    @NotNull(message = "New slot ID is required")
    private Long newSlotId;

    private String reason;
}

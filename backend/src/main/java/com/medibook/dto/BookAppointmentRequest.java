package com.medibook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookAppointmentRequest {

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Slot ID is required")
    private Long slotId;

    @NotBlank(message = "Reason for visit is required")
    @Size(min = 3, max = 500, message = "Reason must be between 3 and 500 characters")
    private String reason;
}

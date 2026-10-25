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
public class DoctorApprovalRequest {
    @NotNull(message = "Approval status must be specified")
    private Boolean approved;
    private String reason;
}

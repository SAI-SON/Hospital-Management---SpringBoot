package com.medibook.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorLeaveDto {
    private Long id;
    private Long doctorId;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate leaveDate;
    private String reason;
}

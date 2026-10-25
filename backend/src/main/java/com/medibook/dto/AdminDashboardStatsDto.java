package com.medibook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsDto {
    private long totalPatients;
    private long totalDoctors;
    private long pendingDoctorApprovals;
    private long totalAppointments;
    private long todayAppointments;
    private BigDecimal totalRevenue;
    
    // Chart data
    private List<DailyAppointmentStat> appointmentsPerDay;
    private List<SpecializationStat> appointmentsPerSpecialization;
    private Map<String, Long> appointmentsByStatus;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyAppointmentStat {
        private String date;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SpecializationStat {
        private String specialization;
        private long count;
    }
}

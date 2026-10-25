package com.medibook.repository;

import com.medibook.entity.Appointment;
import com.medibook.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByReferenceNo(String referenceNo);

    @Query("""
        SELECT a FROM Appointment a
        WHERE a.patient.id = :patientId
        AND (:status IS NULL OR a.status = :status)
        ORDER BY a.appointmentDate DESC, a.startTime DESC
    """)
    Page<Appointment> findByPatientIdAndStatus(
            @Param("patientId") Long patientId,
            @Param("status") AppointmentStatus status,
            Pageable pageable
    );

    @Query("""
        SELECT a FROM Appointment a
        WHERE a.doctor.id = :doctorId
        AND (:date IS NULL OR a.appointmentDate = :date)
        AND (:status IS NULL OR a.status = :status)
        ORDER BY a.appointmentDate ASC, a.startTime ASC
    """)
    Page<Appointment> findByDoctorIdAndFilters(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("status") AppointmentStatus status,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.patient.id = :patientId
        AND a.appointmentDate = :date
        AND a.status IN (:activeStatuses)
        AND (:excludeId IS NULL OR a.id != :excludeId)
        AND (
            (a.startTime < :endTime AND a.endTime > :startTime)
        )
    """)
    boolean existsOverlappingAppointmentForPatient(
            @Param("patientId") Long patientId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("activeStatuses") List<AppointmentStatus> activeStatuses,
            @Param("excludeId") Long excludeId
    );

    long countByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);
    long countByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    long countByAppointmentDate(LocalDate date);
    long countByStatus(AppointmentStatus status);

    Page<Appointment> findAllByOrderByAppointmentDateDescStartTimeDesc(Pageable pageable);
    Page<Appointment> findByStatusOrderByAppointmentDateDescStartTimeDesc(AppointmentStatus status, Pageable pageable);

    @Query("""
        SELECT a FROM Appointment a
        WHERE (:status IS NULL OR a.status = :status)
        AND (:fromDate IS NULL OR a.appointmentDate >= :fromDate)
        AND (:toDate IS NULL OR a.appointmentDate <= :toDate)
        ORDER BY a.appointmentDate DESC, a.startTime DESC
    """)
    Page<Appointment> findAllWithFilters(
            @Param("status") AppointmentStatus status,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );

    @Query("SELECT a.doctor.specialization.name, COUNT(a) FROM Appointment a GROUP BY a.doctor.specialization.name")
    List<Object[]> countAppointmentsBySpecialization();

    @Query("SELECT a.appointmentDate, COUNT(a) FROM Appointment a WHERE a.appointmentDate >= :since GROUP BY a.appointmentDate ORDER BY a.appointmentDate ASC")
    List<Object[]> countAppointmentsPerDaySince(@Param("since") LocalDate since);

    @Query("SELECT COALESCE(SUM(a.doctor.consultationFee), 0) FROM Appointment a WHERE a.status = 'COMPLETED'")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :date AND a.status IN ('PENDING', 'CONFIRMED')")
    List<Appointment> findActiveAppointmentsOnDate(@Param("date") LocalDate date);
}

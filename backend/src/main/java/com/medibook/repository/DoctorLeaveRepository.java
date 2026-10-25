package com.medibook.repository;

import com.medibook.entity.Doctor;
import com.medibook.entity.DoctorLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, Long> {
    List<DoctorLeave> findByDoctorAndLeaveDateGreaterThanEqualOrderByLeaveDateAsc(Doctor doctor, LocalDate fromDate);
    List<DoctorLeave> findByDoctorIdAndLeaveDateBetweenOrderByLeaveDateAsc(Long doctorId, LocalDate startDate, LocalDate endDate);
    boolean existsByDoctorAndLeaveDate(Doctor doctor, LocalDate leaveDate);
    Optional<DoctorLeave> findByDoctorAndLeaveDate(Doctor doctor, LocalDate leaveDate);
}

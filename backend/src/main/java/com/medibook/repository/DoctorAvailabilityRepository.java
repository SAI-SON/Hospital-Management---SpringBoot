package com.medibook.repository;

import com.medibook.entity.Doctor;
import com.medibook.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
    List<DoctorAvailability> findByDoctorOrderByDayOfWeekAsc(Doctor doctor);
    List<DoctorAvailability> findByDoctorIdAndIsActiveTrueOrderByDayOfWeekAsc(Long doctorId);
    Optional<DoctorAvailability> findByDoctorAndDayOfWeek(Doctor doctor, int dayOfWeek);
    void deleteByDoctor(Doctor doctor);
}

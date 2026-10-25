package com.medibook.repository;

import com.medibook.entity.Doctor;
import com.medibook.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByAppointmentId(Long appointmentId);
    Optional<Review> findByAppointmentId(Long appointmentId);
    Page<Review> findByDoctorOrderByCreatedAtDesc(Doctor doctor, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId")
    Double calculateAverageRatingForDoctor(@Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.doctor.id = :doctorId")
    long countReviewsForDoctor(@Param("doctorId") Long doctorId);
}

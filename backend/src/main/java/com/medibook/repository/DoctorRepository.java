package com.medibook.repository;

import com.medibook.entity.Doctor;
import com.medibook.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long>, JpaSpecificationExecutor<Doctor> {
    Optional<Doctor> findByUser(User user);
    Optional<Doctor> findByUserId(Long userId);
    boolean existsByLicenseNumber(String licenseNumber);
    long countByIsApproved(boolean isApproved);
    Page<Doctor> findByIsApproved(boolean isApproved, Pageable pageable);

    @Query("""
        SELECT d FROM Doctor d
        WHERE d.isApproved = true
        AND (cast(:search as string) IS NULL OR LOWER(d.fullName) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(d.bio) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))
        AND (:specializationId IS NULL OR d.specialization.id = :specializationId)
        AND (cast(:city as string) IS NULL OR LOWER(d.clinicCity) = LOWER(cast(:city as string)))
        AND (:minFee IS NULL OR d.consultationFee >= :minFee)
        AND (:maxFee IS NULL OR d.consultationFee <= :maxFee)
        AND (:availableOnly IS NULL OR d.isAvailable = :availableOnly)
        AND (:minRating IS NULL OR d.ratingAverage >= :minRating)
    """)
    Page<Doctor> searchDoctors(
            @Param("search") String search,
            @Param("specializationId") Long specializationId,
            @Param("city") String city,
            @Param("minFee") BigDecimal minFee,
            @Param("maxFee") BigDecimal maxFee,
            @Param("availableOnly") Boolean availableOnly,
            @Param("minRating") BigDecimal minRating,
            Pageable pageable
    );
}

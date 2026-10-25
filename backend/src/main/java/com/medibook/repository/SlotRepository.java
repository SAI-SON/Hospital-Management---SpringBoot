package com.medibook.repository;

import com.medibook.entity.Doctor;
import com.medibook.entity.Slot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {

    boolean existsByDoctorAndSlotStart(Doctor doctor, Instant slotStart);

    @Query("SELECT s FROM Slot s WHERE s.doctor.id = :doctorId AND s.slotStart >= :startRange AND s.slotEnd <= :endRange ORDER BY s.slotStart ASC")
    List<Slot> findSlotsByDoctorAndRange(
            @Param("doctorId") Long doctorId,
            @Param("startRange") Instant startRange,
            @Param("endRange") Instant endRange
    );

    @Query("SELECT s FROM Slot s WHERE s.doctor.id = :doctorId AND s.isBooked = false AND s.slotStart >= :startRange AND s.slotEnd <= :endRange ORDER BY s.slotStart ASC")
    List<Slot> findAvailableSlotsByDoctorAndRange(
            @Param("doctorId") Long doctorId,
            @Param("startRange") Instant startRange,
            @Param("endRange") Instant endRange
    );

    // CRITICAL: Pessimistic write lock prevents two concurrent transactions from securing the same slot
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Slot s WHERE s.id = :id")
    Optional<Slot> findByIdWithLock(@Param("id") Long id);

    @Modifying
    @Query("DELETE FROM Slot s WHERE s.doctor.id = :doctorId AND s.isBooked = false AND s.slotStart >= :fromTime")
    void deleteUnbookedFutureSlots(@Param("doctorId") Long doctorId, @Param("fromTime") Instant fromTime);
}

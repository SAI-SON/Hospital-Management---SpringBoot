package com.medibook.repository;

import com.medibook.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecializationRepository extends JpaRepository<Specialization, Long> {
    List<Specialization> findAllByIsActiveTrueOrderByNameAsc();
    Optional<Specialization> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}

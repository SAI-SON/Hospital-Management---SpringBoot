package com.medibook.repository;

import com.medibook.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndIsDeletedFalse(String email);
    Optional<User> findByEmail(String email);
    boolean existsByEmailAndIsDeletedFalse(String email);

    org.springframework.data.domain.Page<User> findAllByIsDeletedFalse(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("""
        SELECT u FROM User u
        WHERE u.isDeleted = false
        AND (:search IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:roleName IS NULL OR u.role.name = :roleName)
        ORDER BY u.createdAt DESC
    """)
    org.springframework.data.domain.Page<User> searchUsers(
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("roleName") com.medibook.entity.RoleName roleName,
            org.springframework.data.domain.Pageable pageable
    );
}

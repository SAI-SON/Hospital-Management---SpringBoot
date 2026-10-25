package com.medibook.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "specialization_id", nullable = false)
    private Specialization specialization;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "license_number", nullable = false, unique = true, length = 100)
    private String licenseNumber;

    @Column(name = "years_of_experience", nullable = false)
    @Builder.Default
    private int yearsOfExperience = 0;

    @Column(name = "consultation_fee", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal consultationFee = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "clinic_address", columnDefinition = "TEXT")
    private String clinicAddress;

    @Column(name = "clinic_city", length = 100)
    private String clinicCity;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "rating_average", nullable = false, precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal ratingAverage = BigDecimal.ZERO;

    @Column(name = "total_reviews", nullable = false)
    @Builder.Default
    private int totalReviews = 0;

    @Column(name = "is_approved", nullable = false)
    @Builder.Default
    private boolean isApproved = false;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private boolean isAvailable = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

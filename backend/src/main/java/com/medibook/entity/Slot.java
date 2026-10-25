package com.medibook.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "slots", uniqueConstraints = {
    @UniqueConstraint(name = "uq_doctor_slot_start", columnNames = {"doctor_id", "slot_start"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "slot_start", nullable = false)
    private Instant slotStart;

    @Column(name = "slot_end", nullable = false)
    private Instant slotEnd;

    @Column(name = "is_booked", nullable = false)
    @Builder.Default
    private boolean isBooked = false;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}

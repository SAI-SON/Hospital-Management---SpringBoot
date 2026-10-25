package com.medibook.dto;

import com.medibook.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminDto {
    private Long id;
    private String email;
    private String role;
    private UserStatus status;
    private String fullName;
    private String phoneNumber;
    private int failedLoginAttempts;
    private Instant lockUntil;
    private boolean isDeleted;
    private Instant createdAt;
}

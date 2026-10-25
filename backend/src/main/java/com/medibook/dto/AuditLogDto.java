package com.medibook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private Long id;
    private Long userId;
    private String userEmail;
    private String action;
    private String entityName;
    private String entityId;
    private String ipAddress;
    private String userAgent;
    private String details;
    private Instant createdAt;
}

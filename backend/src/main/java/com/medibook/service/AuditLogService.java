package com.medibook.service;

import com.medibook.dto.AuditLogDto;
import com.medibook.dto.PageResponse;
import com.medibook.entity.User;

public interface AuditLogService {
    void logAction(User user, String action, String entityName, String entityId, String ipAddress, String userAgent, String details);
    PageResponse<AuditLogDto> getAuditLogs(String action, int page, int size);
}

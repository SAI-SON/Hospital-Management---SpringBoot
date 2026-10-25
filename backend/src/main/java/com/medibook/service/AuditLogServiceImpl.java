package com.medibook.service;

import com.medibook.dto.AuditLogDto;
import com.medibook.dto.PageResponse;
import com.medibook.entity.AuditLog;
import com.medibook.entity.User;
import com.medibook.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(User user, String action, String entityName, String entityId, String ipAddress, String userAgent, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entityName(entityName)
                    .entityId(entityId)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .details(details)
                    .build();
            auditLogRepository.save(auditLog);
            log.debug("Audit logged: action={}, user={}", action, user != null ? user.getEmail() : "anonymous");
        } catch (Exception e) {
            log.error("Failed to persist audit log: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditLogDto> getAuditLogs(String action, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<AuditLog> logPage;
        if (action != null && !action.isBlank()) {
            logPage = auditLogRepository.findByActionOrderByCreatedAtDesc(action.trim(), pageRequest);
        } else {
            logPage = auditLogRepository.findAllByOrderByCreatedAtDesc(pageRequest);
        }

        List<AuditLogDto> content = logPage.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PageResponse.<AuditLogDto>builder()
                .content(content)
                .pageNumber(logPage.getNumber())
                .pageSize(logPage.getSize())
                .totalElements(logPage.getTotalElements())
                .totalPages(logPage.getTotalPages())
                .isLast(logPage.isLast())
                .build();
    }

    private AuditLogDto mapToDto(AuditLog a) {
        return AuditLogDto.builder()
                .id(a.getId())
                .userId(a.getUser() != null ? a.getUser().getId() : null)
                .userEmail(a.getUser() != null ? a.getUser().getEmail() : "System / Anonymous")
                .action(a.getAction())
                .entityName(a.getEntityName())
                .entityId(a.getEntityId())
                .ipAddress(a.getIpAddress())
                .userAgent(a.getUserAgent())
                .details(a.getDetails())
                .createdAt(a.getCreatedAt())
                .build();
    }
}

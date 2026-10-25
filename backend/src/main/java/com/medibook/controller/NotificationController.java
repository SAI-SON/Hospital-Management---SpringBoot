package com.medibook.controller;

import com.medibook.dto.ApiResponse;
import com.medibook.dto.NotificationDto;
import com.medibook.dto.PageResponse;
import com.medibook.security.UserPrincipal;
import com.medibook.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for managing user notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user notifications")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDto>>> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<NotificationDto> notifications = notificationService.getUserNotifications(
                principal.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notifications));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        long count = notificationService.getUnreadCount(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", Map.of("unreadCount", count)));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<ApiResponse<String>> markAsRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        notificationService.markAsRead(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all notifications as read for current user")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}

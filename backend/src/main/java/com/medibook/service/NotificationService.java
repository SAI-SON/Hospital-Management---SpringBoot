package com.medibook.service;

import com.medibook.dto.NotificationDto;
import com.medibook.dto.PageResponse;
import com.medibook.entity.User;

public interface NotificationService {
    PageResponse<NotificationDto> getUserNotifications(Long userId, int page, int size);
    long getUnreadCount(Long userId);
    void markAsRead(Long userId, Long notificationId);
    void markAllAsRead(Long userId);
    void createNotification(User user, String title, String message, String type);
}

package com.medibook.service;

import com.medibook.dto.NotificationDto;
import com.medibook.dto.PageResponse;
import com.medibook.entity.Notification;
import com.medibook.entity.User;
import com.medibook.exception.ResourceNotFoundException;
import com.medibook.repository.NotificationRepository;
import com.medibook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationDto> getUserNotifications(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Page<Notification> notificationPage = notificationRepository.findByUserOrderByCreatedAtDesc(
                user, PageRequest.of(page, size));

        List<NotificationDto> content = notificationPage.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PageResponse.<NotificationDto>builder()
                .content(content)
                .pageNumber(notificationPage.getNumber())
                .pageSize(notificationPage.getSize())
                .totalElements(notificationPage.getTotalElements())
                .totalPages(notificationPage.getTotalPages())
                .isLast(notificationPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification", "id", notificationId);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        notificationRepository.markAllAsReadForUser(user);
    }

    @Override
    @Transactional
    public void createNotification(User user, String title, String message, String type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
        log.info("Created notification for user {}: {}", user.getEmail(), title);
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}

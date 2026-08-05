package com.insa.helpdesk.notification.repository;

import com.insa.helpdesk.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Data access for notifications (FR-027).
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** Unread notifications for a recipient (e.g. an unread badge). */
    List<Notification> findByRecipientIdAndReadFalse(Long recipientId);
}
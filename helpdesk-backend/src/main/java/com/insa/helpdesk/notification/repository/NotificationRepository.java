package com.insa.helpdesk.notification.repository;

import com.insa.helpdesk.notification.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Data access for notifications (FR-027).
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** Unread notifications for a recipient (e.g. an unread badge). */
    List<Notification> findByRecipientIdAndReadFalse(Long recipientId);

    /** Recent notifications for a recipient, newest first. */
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    /** Secure lookup scoped to the authenticated recipient. */
    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);

    /** Unread notification count for the badge. */
    long countByRecipientIdAndReadFalse(Long recipientId);
}

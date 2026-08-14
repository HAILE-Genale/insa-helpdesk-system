package com.insa.helpdesk.sla;

import com.insa.helpdesk.notification.NotificationService;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.ticket.repository.TicketRepository;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * SLA tracking service (FRD 3.5, FR-023).
 *
 * <p>Every ticket gets an SLA deadline based on its priority:
 * <ul>
 *   <li>CRITICAL → 4 hours</li>
 *   <li>HIGH     → 8 hours</li>
 *   <li>MEDIUM   → 24 hours</li>
 *   <li>LOW      → 72 hours</li>
 * </ul>
 * A scheduled job runs every 60 seconds, checks all open/in-progress/on-hold
 * tickets against their deadline, and:
 * <ul>
 *   <li>Sends an "SLA BREACH IMMINENT" warning to the assignee 30 minutes before</li>
 *   <li>Sends an "SLA BREACHED" notification to all HELPDESK_MANAGERs the moment it passes</li>
 * </ul>
 * Notifications are delivered in real time via SSE to connected browsers.</p>
 */
@Service
@RequiredArgsConstructor
public class SlaService {

    private static final Logger logger = LoggerFactory.getLogger(SlaService.class);

    public static final long WARNING_BEFORE_BREACH_MINUTES = 30;
    public static final List<String> ACTIVE_STATUSES = List.of("OPEN", "IN_PROGRESS", "ON_HOLD");
    public static final List<String> TERMINAL_STATUSES = List.of("RESOLVED", "CLOSED");

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Return the number of hours before an SLA breakout for a given priority.
     * These are the default policy targets — admin-configurable in a real deployment.
     */
    public long slaHoursForPriority(String priority) {
        if (priority == null) return 24;
        return switch (priority.toUpperCase()) {
            case "CRITICAL" -> 4;
            case "HIGH"     -> 8;
            case "MEDIUM"   -> 24;
            case "LOW"      -> 72;
            default         -> 24;
        };
    }

    /** Compute the SLA deadline for a new ticket based on its priority. */
    public ZonedDateTime computeSlaDeadline(Ticket ticket) {
        if (ticket == null || ticket.getCreatedAt() == null) return null;
        return ticket.getCreatedAt().plusHours(slaHoursForPriority(ticket.getPriority()));
    }

    /**
     * Apply an SLA deadline on a newly created ticket.
     * Called from TicketService after creation + routing.
     */
    @Transactional
    public Ticket applySlaDeadline(Ticket ticket) {
        if (ticket.getSlaDeadline() == null) {
            ticket.setSlaDeadline(computeSlaDeadline(ticket));
            return ticketRepository.save(ticket);
        }
        return ticket;
    }

    /**
     * Scheduled task — every 60 seconds.
     * Finds all active (open/in-progress/on-hold) tickets that are within the
     * warning window or have already passed their SLA deadline.
     */
    @Scheduled(fixedDelay = 60_000, initialDelay = 30_000)
    @Transactional
    public void checkSlaViolations() {
        logger.debug("Running SLA violation check...");
        List<Ticket> activeTickets = ticketRepository.findByStatusIn(ACTIVE_STATUSES);
        ZonedDateTime now = ZonedDateTime.now();

        for (Ticket ticket : activeTickets) {
            if (ticket.getSlaDeadline() == null) {
                // Backfill deadline for tickets created before this feature existed.
                ticket.setSlaDeadline(computeSlaDeadline(ticket));
                ticketRepository.save(ticket);
                continue;
            }

            long minutesToDeadline = ChronoUnit.MINUTES.between(now, ticket.getSlaDeadline());
            boolean breached = minutesToDeadline <= 0 && !ticket.isSlaViolated();

            if (breached) {
                markViolated(ticket, now);
            } else if (minutesToDeadline > 0
                    && minutesToDeadline <= WARNING_BEFORE_BREACH_MINUTES
                    && !ticket.isSlaWarningSent()) {
                sendBreachImminentWarning(ticket, minutesToDeadline);
            }
        }
    }

    /**
     * Mark a ticket as SLA-violated, notify all managers in real time,
     * and optionally clear the deadline once resolved.
     */
    @Transactional
    public void markViolated(Ticket ticket, ZonedDateTime now) {
        if (ticket == null || ticket.isSlaViolated()) return;

        ticket.setSlaViolated(true);
        ticket.setSlaBreachedAt(now);
        ticketRepository.save(ticket);

        notificationService.notifySlaBreached(ticket);
        logger.warn("SLA BREACHED for ticket {} ({}), priority {}, deadline was {}",
                ticket.getTicketNumber(), ticket.getId(), ticket.getPriority(), ticket.getSlaDeadline());
    }

    /** Clear the SLA-violated flag when a ticket reaches a terminal status. */
    @Transactional
    public void clearViolationOnResolve(Ticket ticket) {
        if (ticket == null) return;
        if (ticket.isSlaViolated() && TERMINAL_STATUSES.contains(ticket.getStatus())) {
            ticket.setSlaViolated(false);
            ticket.setSlaBreachedAt(null);
            ticketRepository.save(ticket);
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private void sendBreachImminentWarning(Ticket ticket, long minutesToDeadline) {
        ticket.setSlaWarningSent(true);
        ticketRepository.save(ticket);
        notificationService.notifySlaBreachImminent(ticket, minutesToDeadline);
        logger.info("SLA warning for ticket {} ({}): {} minutes to deadline",
                ticket.getTicketNumber(), ticket.getId(), minutesToDeadline);
    }

    /**
     * All managers (HELPDESK_MANAGER) that should receive SLA breach notices.
     * Falls back to SYSTEM_ADMINs if no manager exists.
     */
    public List<User> getSlaBreachRecipients() {
        List<User> managers = userRepository.findByRoleNameAndActiveTrue("HELPDESK_MANAGER");
        if (managers.isEmpty()) {
            managers = userRepository.findByRoleNameAndActiveTrue("SYSTEM_ADMIN");
        }
        return managers;
    }
}
package com.insa.helpdesk.report;

import com.insa.helpdesk.feedback.repository.FeedbackRepository;
import com.insa.helpdesk.report.dto.ReportResponseDto;
import com.insa.helpdesk.sla.SlaService;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.ticket.entity.TicketHistory;
import com.insa.helpdesk.ticket.repository.TicketHistoryRepository;
import com.insa.helpdesk.ticket.repository.TicketRepository;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Real-time report generation (FRD 3.5 "Reporting").
 *
 * <p>Computes KPIs, status/priority/category breakdowns, agent performance
 * metrics, SLA compliance, and feedback summary directly from the database.
 * No hardcoded or demo data — everything is computed from live ticket data.</p>
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final TicketRepository ticketRepository;
    private final TicketHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;
    private final SlaService slaService;

    private static final List<String> TERMINAL_STATUSES = List.of("RESOLVED", "CLOSED");

    /**
     * Generate a full report. If userId is provided and the user is a manager,
     * only their team's tickets are included. Otherwise all tickets are included
     * (admin/system-admin scope).
     */
    @Transactional(readOnly = true)
    public ReportResponseDto generateReport(Long userId, String roleName) {
        List<Ticket> allTickets;
        if (userId != null && "HELPDESK_MANAGER".equals(roleName)) {
            allTickets = getTicketsForManager(userId);
        } else {
            allTickets = ticketRepository.findAll();
        }

        List<Ticket> resolvedTickets = allTickets.stream()
                .filter(t -> TERMINAL_STATUSES.contains(t.getStatus()))
                .toList();

        // ── Summary KPIs ──
        long total = allTickets.size();
        long open = countByStatus(allTickets, "OPEN");
        long inProgress = countByStatus(allTickets, "IN_PROGRESS");
        long onHold = countByStatus(allTickets, "ON_HOLD");
        long resolved = countByStatus(allTickets, "RESOLVED");
        long closed = countByStatus(allTickets, "CLOSED");
        long slaBreached = allTickets.stream()
                .filter(t -> t.isSlaViolated() && !TERMINAL_STATUSES.contains(t.getStatus()))
                .count();

        int slaComplianceRate = total > 0
                ? (int) Math.round(100.0 * (1.0 - (double) slaBreached / (double) Math.max(total, 1)))
                : 100;

        double avgResolution = computeAvgResolutionHours(resolvedTickets);

        // ── Breakdown by status ──
        Map<String, Long> statusMap = allTickets.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getStatus() != null ? t.getStatus() : "UNKNOWN",
                        Collectors.counting()));
        List<ReportResponseDto.CategoryCount> statusBreakdown = buildBreakdown(statusMap, total);

        // ── Breakdown by priority ──
        Map<String, Long> priorityMap = allTickets.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getPriority() != null ? t.getPriority() : "UNKNOWN",
                        Collectors.counting()));
        List<ReportResponseDto.CategoryCount> priorityBreakdown = buildBreakdown(priorityMap, total);

        // ── Breakdown by category ──
        Map<String, Long> categoryMap = allTickets.stream()
                .filter(t -> t.getCategory() != null && !t.getCategory().isBlank())
                .collect(Collectors.groupingBy(
                        t -> t.getCategory(),
                        Collectors.counting()));
        List<ReportResponseDto.CategoryCount> categoryBreakdown = buildBreakdown(categoryMap, total);

        // ── Agent performance ──
        List<ReportResponseDto.AgentPerformanceDto> agentPerformance = computeAgentPerformance(resolvedTickets);

        // ── Feedback summary ──
        double avgRating = feedbackRepository.findAll().stream()
                .mapToInt(f -> f.getRating() != null ? f.getRating() : 0)
                .average()
                .orElse(0.0);
        long totalFeedback = feedbackRepository.count();

        // ── Recent tickets (last 10) ──
        List<Ticket> recent = allTickets.stream()
                .sorted(Comparator.comparing(Ticket::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10)
                .toList();
        List<ReportResponseDto.RecentTicketDto> recentTickets = recent.stream()
                .map(this::toRecentDto)
                .toList();

        return ReportResponseDto.builder()
                .period("All time")
                .generatedAt(ZonedDateTime.now().toString())
                .totalTickets(total)
                .openTickets(open)
                .inProgressTickets(inProgress)
                .onHoldTickets(onHold)
                .resolvedTickets(resolved)
                .closedTickets(closed)
                .slaBreachedTickets(slaBreached)
                .slaComplianceRate(Math.max(0, Math.min(100, slaComplianceRate)))
                .avgResolutionHours(Math.round(avgResolution * 10.0) / 10.0)
                .statusBreakdown(statusBreakdown)
                .priorityBreakdown(priorityBreakdown)
                .categoryBreakdown(categoryBreakdown)
                .agentPerformance(agentPerformance)
                .avgRating(Math.round(avgRating * 10.0) / 10.0)
                .totalFeedback(totalFeedback)
                .recentTickets(recentTickets)
                .build();
    }

    /**
     * Manager-scoped: only tickets whose team is managed by the given manager,
     * plus tickets where the reporter is in the manager's department.
     */
    private List<Ticket> getTicketsForManager(Long managerId) {
        // Find tickets where the ticket's team is managed by this user
        List<Ticket> teamTickets = ticketRepository.findAll().stream()
                .filter(t -> t.getTeam() != null
                        && t.getTeam().getManager() != null
                        && t.getTeam().getManager().getId().equals(managerId))
                .toList();

        // Also include tickets assigned to agents in teams managed by this manager
        List<Ticket> assignedTickets = ticketRepository.findAll().stream()
                .filter(t -> t.getAssignee() != null)
                .filter(t -> t.getTeam() != null
                        && t.getTeam().getManager() != null
                        && t.getTeam().getManager().getId().equals(managerId))
                .toList();

        // Merge both lists, deduplicate by ticket id
        Set<Ticket> merged = new LinkedHashSet<>();
        merged.addAll(teamTickets);
        merged.addAll(assignedTickets);
        return new ArrayList<>(merged);
    }

    private long countByStatus(List<Ticket> tickets, String status) {
        return tickets.stream().filter(t -> status.equals(t.getStatus())).count();
    }

    private List<ReportResponseDto.CategoryCount> buildBreakdown(Map<String, Long> map, long total) {
        return map.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> ReportResponseDto.CategoryCount.builder()
                        .name(e.getKey())
                        .count(e.getValue())
                        .pct(total > 0 ? (int) Math.round(100.0 * e.getValue() / total) : 0)
                        .build())
                .toList();
    }

    private List<ReportResponseDto.AgentPerformanceDto> computeAgentPerformance(List<Ticket> resolvedTickets) {
        // Get all agents (HELPDESK_AGENT role)
        List<User> agents = userRepository.findByRoleNameAndActiveTrue("HELPDESK_AGENT");

        return agents.stream()
                .map(agent -> {
                    List<Ticket> agentResolved = resolvedTickets.stream()
                            .filter(t -> t.getAssignee() != null && t.getAssignee().getId().equals(agent.getId()))
                            .toList();

                    long resolved = agentResolved.size();
                    double avgResHours = agentResolved.stream()
                            .mapToDouble(t -> {
                                if (t.getCreatedAt() == null) return 0.0;
                                // Find the time when status was set to RESOLVED from history
                                List<TicketHistory> history = historyRepository.findByTicketIdOrderByChangedAtAsc(t.getId());
                                Optional<TicketHistory> resolvedEntry = history.stream()
                                        .filter(h -> "RESOLVED".equals(h.getNewValue()) && "status".equals(h.getFieldName()))
                                        .findFirst();
                                if (resolvedEntry.isPresent() && resolvedEntry.get().getChangedAt() != null) {
                                    long hours = ChronoUnit.MINUTES.between(t.getCreatedAt().toInstant(), resolvedEntry.get().getChangedAt().toInstant()) / 60;
                                    return (double) hours;
                                }
                                return 0.0;
                            })
                            .filter(h -> h > 0)
                            .average()
                            .orElse(0.0);

                    // SLA compliance for this agent's resolved tickets
                    long totalAssigned = ticketRepository.findByAssigneeId(agent.getId()).stream()
                            .filter(t -> TERMINAL_STATUSES.contains(t.getStatus()))
                            .count();
                    long slaViolated = ticketRepository.findByAssigneeId(agent.getId()).stream()
                            .filter(t -> t.isSlaViolated() && TERMINAL_STATUSES.contains(t.getStatus()))
                            .count();
                    int slaCompliance = totalAssigned > 0
                            ? (int) Math.round(100.0 * (1.0 - (double) slaViolated / totalAssigned))
                            : 100;

                    return ReportResponseDto.AgentPerformanceDto.builder()
                            .agentId(agent.getId())
                            .agentName(agent.getUsername())
                            .teamName(null)
                            .resolved(resolved)
                            .avgResolutionHours(Math.round(avgResHours * 10.0) / 10.0)
                            .slaCompliance(Math.max(0, Math.min(100, slaCompliance)))
                            .build();
                })
                .sorted(Comparator.comparingLong(ReportResponseDto.AgentPerformanceDto::getResolved).reversed())
                .toList();
    }

    private ReportResponseDto.RecentTicketDto toRecentDto(Ticket t) {
        return ReportResponseDto.RecentTicketDto.builder()
                .id(t.getId())
                .ticketNumber(t.getTicketNumber())
                .title(t.getTitle())
                .priority(t.getPriority())
                .status(t.getStatus())
                .department(t.getDepartment())
                .assigneeName(t.getAssignee() != null ? t.getAssignee().getUsername() : null)
                .createdAt(t.getCreatedAt() != null ? t.getCreatedAt().toString() : null)
                .build();
    }

    private double computeAvgResolutionHours(List<Ticket> resolvedTickets) {
        if (resolvedTickets.isEmpty()) return 0.0;

        double sum = 0;
        int count = 0;
        for (Ticket t : resolvedTickets) {
            if (t.getCreatedAt() == null) continue;
            List<TicketHistory> history = historyRepository.findByTicketIdOrderByChangedAtAsc(t.getId());
            Optional<TicketHistory> resolvedEntry = history.stream()
                    .filter(h -> "RESOLVED".equals(h.getNewValue()) && "status".equals(h.getFieldName()))
                    .findFirst();
            if (resolvedEntry.isPresent() && resolvedEntry.get().getChangedAt() != null) {
                long minutes = ChronoUnit.MINUTES.between(t.getCreatedAt().toInstant(), resolvedEntry.get().getChangedAt().toInstant());
                sum += minutes / 60.0;
                count++;
            }
        }
        return count > 0 ? sum / count : 0.0;
    }
}

package com.insa.helpdesk.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Aggregated report data returned by GET /reports.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponseDto {

    // ── Period ──
    private String period;
    private String generatedAt;

    // ── Summary KPIs ──
    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;
    private long onHoldTickets;
    private long resolvedTickets;
    private long closedTickets;
    private long slaBreachedTickets;
    private int slaComplianceRate;
    private double avgResolutionHours;

    // ── Breakdown by status ──
    private List<CategoryCount> statusBreakdown;

    // ── Breakdown by priority ──
    private List<CategoryCount> priorityBreakdown;

    // ── Breakdown by category ──
    private List<CategoryCount> categoryBreakdown;

    // ── Agent performance ──
    private List<AgentPerformanceDto> agentPerformance;

    // ── Feedback summary ──
    private double avgRating;
    private long totalFeedback;

    // ── Recent tickets ──
    private List<RecentTicketDto> recentTickets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryCount {
        private String name;
        private long count;
        private int pct;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentPerformanceDto {
        private Long agentId;
        private String agentName;
        private String teamName;
        private long resolved;
        private double avgResolutionHours;
        private int slaCompliance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentTicketDto {
        private Long id;
        private String ticketNumber;
        private String title;
        private String priority;
        private String status;
        private String department;
        private String assigneeName;
        private String createdAt;
    }
}

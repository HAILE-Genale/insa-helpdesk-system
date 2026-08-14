package com.insa.helpdesk.report;

import com.insa.helpdesk.common.dto.ApiResponse;
import com.insa.helpdesk.common.security.UserPrincipal;
import com.insa.helpdesk.report.dto.ReportResponseDto;
import com.insa.helpdesk.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoint for real-time helpdesk reports and analytics (FRD 3.5 "Reporting").
 *
 * <p>Generates KPIs, status/priority/category breakdowns, agent performance,
 * SLA compliance, and feedback summary directly from the database.
 * No hardcoded or demo data.</p>
 */
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * GET /reports — returns aggregated report data.
     * Managers see only their team's metrics; admins see everything.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('REPORTING_VIEW')")
    public ApiResponse<ReportResponseDto> getReports(Authentication authentication) {
        User user = resolveUser(authentication);
        String roleName = user.getRole() != null ? user.getRole().getName() : "";
        Long userId = "HELPDESK_MANAGER".equals(roleName) ? user.getId() : null;

        ReportResponseDto report = reportService.generateReport(userId, roleName);
        return ApiResponse.success(report, "Reports generated");
    }

    private User resolveUser(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal up) {
            return up.getUser();
        }
        return User.builder().id(1L).username("system").build();
    }
}

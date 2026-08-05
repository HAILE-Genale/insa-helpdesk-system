package com.insa.helpdesk.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response body for a support team (FRD 3.5). Mirrors the shape the frontend
 * "Teams & Routing" page expects.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTeamDto {
    private Long id;
    private String name;
    private String description;
    private boolean isDefault;

    /** The team's agents, with their open-ticket counts. */
    private List<MemberDto> members;

    /** Category names this team auto-routes from. */
    private List<String> routingRules;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberDto {
        private Long id;
        private String username;
        private String email;
        private long openTickets;
    }
}

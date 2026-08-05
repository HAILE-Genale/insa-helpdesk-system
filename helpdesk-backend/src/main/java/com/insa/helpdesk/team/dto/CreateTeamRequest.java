package com.insa.helpdesk.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request body for creating or updating a support team (FRD 3.5).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTeamRequest {
    private String name;
    private String description;
    private boolean isDefault;

    /** Ids of the users (agents) to put on the team. */
    private List<Long> memberIds;

    /** Category names that auto-route to this team. */
    private List<String> routingCategories;
}

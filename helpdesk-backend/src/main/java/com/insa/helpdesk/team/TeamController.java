package com.insa.helpdesk.team;

import com.insa.helpdesk.common.dto.ApiResponse;
import com.insa.helpdesk.team.dto.CreateTeamRequest;
import com.insa.helpdesk.team.dto.SupportTeamDto;
import com.insa.helpdesk.team.entity.SupportTeam;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST endpoints for support teams and routing rules (FRD 3.5).
 *
 * <p>Team management (create/update/delete, add/remove members, routing rules)
 * requires the {@code TEAM_MANAGE} authority. Viewing teams is allowed for anyone
 * with the {@code TICKET_ASSIGN} authority (agents use it to see routing).</p>
 */
@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    /** List all teams with their members and routing rules. */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('TICKET_ASSIGN', 'TEAM_MANAGE')")
    public ApiResponse<List<SupportTeamDto>> listTeams() {
        List<SupportTeamDto> data = teamService.listTeams().stream()
                .map(teamService::toDto)
                .toList();
        return ApiResponse.success(data, "Teams");
    }

    /** Get one team. */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('TICKET_ASSIGN', 'TEAM_MANAGE')")
    public ApiResponse<SupportTeamDto> getTeam(@PathVariable Long id) {
        return ApiResponse.success(teamService.toDto(teamService.getTeam(id)), "Team");
    }

    /** Create a new team with members and routing rules. */
    @PostMapping
    @PreAuthorize("hasAuthority('TEAM_MANAGE')")
    public ApiResponse<SupportTeamDto> createTeam(@RequestBody CreateTeamRequest request) {
        SupportTeam team = teamService.createTeam(request);
        return ApiResponse.success(teamService.toDto(team), "Team created");
    }

    /** Update a team's name/description/default flag. */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('TEAM_MANAGE')")
    public ApiResponse<SupportTeamDto> updateTeam(@PathVariable Long id, @RequestBody CreateTeamRequest request) {
        return ApiResponse.success(teamService.toDto(teamService.updateTeam(id, request)), "Team updated");
    }

    /** Delete a team. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('TEAM_MANAGE')")
    public ApiResponse<Void> deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ApiResponse.success(null, "Team deleted");
    }

    /** Add an agent (user) to a team. */
    @PostMapping("/{id}/members")
    @PreAuthorize("hasAuthority('TEAM_MANAGE')")
    public ApiResponse<SupportTeamDto> addMember(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        teamService.addMember(id, body.get("userId"));
        return ApiResponse.success(teamService.toDto(teamService.getTeam(id)), "Member added");
    }

    /** Remove an agent from a team. */
    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAuthority('TEAM_MANAGE')")
    public ApiResponse<SupportTeamDto> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        teamService.removeMember(id, userId);
        return ApiResponse.success(teamService.toDto(teamService.getTeam(id)), "Member removed");
    }

    /** Add a routing rule: this category now routes to this team. */
    @PostMapping("/{id}/routing-rules")
    @PreAuthorize("hasAuthority('TEAM_MANAGE')")
    public ApiResponse<SupportTeamDto> addRoutingRule(@PathVariable Long id, @RequestBody Map<String, String> body) {
        teamService.addRoutingRule(id, body.get("category"));
        return ApiResponse.success(teamService.toDto(teamService.getTeam(id)), "Routing rule added");
    }

    /** Remove a routing rule by category. */
    @DeleteMapping("/{id}/routing-rules/{category}")
    @PreAuthorize("hasAuthority('TEAM_MANAGE')")
    public ApiResponse<SupportTeamDto> removeRoutingRule(@PathVariable Long id, @PathVariable String category) {
        teamService.removeRoutingRule(id, category);
        return ApiResponse.success(teamService.toDto(teamService.getTeam(id)), "Routing rule removed");
    }
}
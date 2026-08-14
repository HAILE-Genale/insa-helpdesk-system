
package com.insa.helpdesk.team;

import com.insa.helpdesk.common.exception.ResourceNotFoundException;
import com.insa.helpdesk.team.dto.CreateTeamRequest;
import com.insa.helpdesk.team.dto.SupportTeamDto;
import com.insa.helpdesk.team.entity.SupportTeam;
import com.insa.helpdesk.team.entity.TeamMember;
import com.insa.helpdesk.team.entity.TeamRoutingRule;
import com.insa.helpdesk.team.repository.SupportTeamRepository;
import com.insa.helpdesk.team.repository.TeamMemberRepository;
import com.insa.helpdesk.team.repository.TeamRoutingRuleRepository;
import com.insa.helpdesk.ticket.repository.TicketRepository;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Support team management (FRD 3.5 "Assignment and Routing").
 */
@Service
@RequiredArgsConstructor
public class TeamService {

    private final SupportTeamRepository teamRepository;
    private final TeamMemberRepository memberRepository;
    private final TeamRoutingRuleRepository routingRuleRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    /** Create a team with its members and routing rules. */
    @Transactional
    public SupportTeam createTeam(CreateTeamRequest request) {
        if (teamRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("A team named '" + request.getName() + "' already exists");
        }

        SupportTeam team = SupportTeam.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isDefault(request.isDefault())
                .build();

        // Manager is mandatory
        if (request.getManagerId() == null) {
            throw new IllegalArgumentException("A team manager is required");
        }
        User manager = userRepository.findById(request.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("Manager user not found: " + request.getManagerId()));
        team.setManager(manager);
        teamRepository.save(team);

        if (request.getMemberIds() != null) {
            request.getMemberIds().forEach(userId -> addMemberInternal(team, userId));
        }
        if (request.getRoutingCategories() != null) {
            request.getRoutingCategories().forEach(cat -> addRoutingRuleInternal(team, cat));
        }
        return team;
    }

    /** List all teams with their members and routing rules. */
    @Transactional(readOnly = true)
    public List<SupportTeam> listTeams() {
        return teamRepository.findAll();
    }

    /** Get one team or throw 404. */
    @Transactional(readOnly = true)
    public SupportTeam getTeam(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + id));
    }

    /** Update a team's name/description/default flag. */
    @Transactional
    public SupportTeam updateTeam(Long id, CreateTeamRequest request) {
        SupportTeam team = getTeam(id);
        if (request.getName() != null && !request.getName().isBlank()) {
            // Prevent renaming onto an existing team's name.
            teamRepository.findByName(request.getName().trim())
                    .filter(other -> !other.getId().equals(id))
                    .ifPresent(other -> {
                        throw new IllegalArgumentException("A team named '" + request.getName() + "' already exists");
                    });
            team.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            team.setDescription(request.getDescription());
        }
        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found: " + request.getManagerId()));
            team.setManager(manager);
        }
        team.setDefault(request.isDefault());
        return teamRepository.save(team);
    }

    /** Delete a team (members and rules cascade in the database). */
    @Transactional
    public void deleteTeam(Long id) {
        if (!teamRepository.existsById(id)) {
            throw new ResourceNotFoundException("Team not found: " + id);
        }
        teamRepository.deleteById(id);
    }

    /** Add an agent to a team. */
    @Transactional
    public void addMember(Long teamId, Long userId) {
        SupportTeam team = getTeam(teamId);
        if (memberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new IllegalArgumentException("User is already a member of this team");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        addMemberInternal(team, userId);
    }

    /** Remove an agent from a team. */
    @Transactional
    public void removeMember(Long teamId, Long userId) {
        SupportTeam team = getTeam(teamId);
        team.getMembers().removeIf(m -> m.getUser().getId().equals(userId));
        teamRepository.save(team);
    }

    /** Add a routing rule (category -> this team). */
    @Transactional
    public void addRoutingRule(Long teamId, String category) {
        SupportTeam team = getTeam(teamId);
        if (routingRuleRepository.existsByTeamIdAndCategory(teamId, category)) {
            throw new IllegalArgumentException("This team already has a routing rule for category '" + category + "'");
        }
        addRoutingRuleInternal(team, category);
    }

    /** Remove a routing rule by category. */
    @Transactional
    public void removeRoutingRule(Long teamId, String category) {
        SupportTeam team = getTeam(teamId);
        team.getRoutingRules().removeIf(r -> r.getCategory().equals(category));
        teamRepository.save(team);
    }

    /** Build the response DTO for a team (with open-ticket counts per agent). */
    @Transactional(readOnly = true)
    public SupportTeamDto toDto(SupportTeam team) {
        List<SupportTeamDto.MemberDto> members = team.getMembers().stream()
                .map(m -> {
                    User u = m.getUser();
                    long open = ticketRepository.countByAssigneeIdAndStatusIn(u.getId(), List.of("OPEN", "IN_PROGRESS"));
                    return SupportTeamDto.MemberDto.builder()
                            .id(u.getId())
                            .username(u.getUsername())
                            .email(u.getEmail())
                            .openTickets(open)
                            .build();
                })
                .toList();

        List<String> rules = team.getRoutingRules().stream()
                .map(TeamRoutingRule::getCategory)
                .toList();

        return SupportTeamDto.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .isDefault(team.isDefault())
                .members(members)
                .routingRules(rules)
                .manager(team.getManager() != null ? SupportTeamDto.ManagerDto.builder()
                        .id(team.getManager().getId())
                        .username(team.getManager().getUsername())
                        .email(team.getManager().getEmail())
                        .build() : null)
                .build();
    }

    private void addMemberInternal(SupportTeam team, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        TeamMember member = TeamMember.builder().team(team).user(user).build();
        team.getMembers().add(member);
        memberRepository.save(member);
    }

    private void addRoutingRuleInternal(SupportTeam team, String category) {
        TeamRoutingRule rule = TeamRoutingRule.builder().team(team).category(category).build();
        team.getRoutingRules().add(rule);
        routingRuleRepository.save(rule);
    }
}
package com.insa.helpdesk.team.repository;

import com.insa.helpdesk.team.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Data access for team memberships (FRD 3.5).
 */
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    /** All members of a team. */
    List<TeamMember> findByTeamId(Long teamId);

    /** True if the given user is already a member of the team. */
    boolean existsByTeamIdAndUserId(Long teamId, Long userId);
}
package com.insa.helpdesk.team.repository;

import com.insa.helpdesk.team.entity.SupportTeam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Data access for support teams (FRD 3.5).
 */
public interface SupportTeamRepository extends JpaRepository<SupportTeam, Long> {

    /** Find a team by its exact name (e.g. the "Tier-1 Helpdesk" fallback team). */
    Optional<SupportTeam> findByName(String name);

    /** Find the fallback team(s) — the one marked as default. */
    List<SupportTeam> findByIsDefaultTrue();

    /** Find the team that owns a routing rule for the given category. */
    Optional<SupportTeam> findByRoutingRulesCategory(String category);
}
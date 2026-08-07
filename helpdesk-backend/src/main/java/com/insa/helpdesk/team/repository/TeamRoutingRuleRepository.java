package com.insa.helpdesk.team.repository;

import com.insa.helpdesk.team.entity.TeamRoutingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Data access for routing rules (FRD 3.5).
 */
public interface TeamRoutingRuleRepository extends JpaRepository<TeamRoutingRule, Long> {

    /**
     * Find all routing rules matching a category, ordered so that
     * non-default (specialist) teams come first.
     */
    @Query("SELECT r FROM TeamRoutingRule r JOIN r.team t " +
           "WHERE r.category = :category " +
           "ORDER BY t.isDefault ASC, t.id ASC")
    List<TeamRoutingRule> findByCategory(@Param("category") String category);

    /** True if a routing rule already exists for this (team, category) pair. */
    boolean existsByTeamIdAndCategory(Long teamId, String category);
}

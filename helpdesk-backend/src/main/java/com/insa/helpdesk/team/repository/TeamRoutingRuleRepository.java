package com.insa.helpdesk.team.repository;

import com.insa.helpdesk.team.entity.TeamRoutingRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Data access for routing rules (FRD 3.5).
 */
public interface TeamRoutingRuleRepository extends JpaRepository<TeamRoutingRule, Long> {

    /** Find the routing rule that matches a ticket category. */
    Optional<TeamRoutingRule> findByCategory(String category);

    /** True if a routing rule already exists for this category. */
    boolean existsByCategory(String category);
}
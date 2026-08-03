package com.insa.helpdesk.priority;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriorityMatrixConfigRepository extends JpaRepository<PriorityMatrixConfig, Long> {

    Optional<PriorityMatrixConfig> findByImpactAndUrgency(Impact impact, Urgency urgency);

    List<PriorityMatrixConfig> findByImpact(Impact impact);
}

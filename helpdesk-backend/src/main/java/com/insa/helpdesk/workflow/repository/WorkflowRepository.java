package com.insa.helpdesk.workflow.repository;

import com.insa.helpdesk.workflow.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, String> {
}

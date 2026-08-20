package com.insa.helpdesk.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowDto {
    private String id;
    private String name;
    private String description;
    private String status;
    private String triggerCondition;
    private String action;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

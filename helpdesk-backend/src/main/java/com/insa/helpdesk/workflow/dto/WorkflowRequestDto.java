package com.insa.helpdesk.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorkflowRequestDto {
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    private String status = "ACTIVE";
    
    @NotBlank(message = "Trigger condition is required")
    private String triggerCondition;
    
    @NotBlank(message = "Action is required")
    private String action;
}

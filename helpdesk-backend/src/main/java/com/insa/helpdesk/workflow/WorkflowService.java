package com.insa.helpdesk.workflow;

import com.insa.helpdesk.workflow.dto.WorkflowDto;
import com.insa.helpdesk.workflow.dto.WorkflowRequestDto;
import com.insa.helpdesk.workflow.entity.Workflow;
import com.insa.helpdesk.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;

    public List<WorkflowDto> getAllWorkflows() {
        return workflowRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public WorkflowDto getWorkflow(String id) {
        return workflowRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Workflow not found with id: " + id));
    }

    public WorkflowDto createWorkflow(WorkflowRequestDto request) {
        Workflow workflow = Workflow.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .triggerCondition(request.getTriggerCondition())
                .action(request.getAction())
                .build();
        return toDto(workflowRepository.save(workflow));
    }

    public WorkflowDto updateWorkflow(String id, WorkflowRequestDto request) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found with id: " + id));
        
        workflow.setName(request.getName());
        workflow.setDescription(request.getDescription());
        workflow.setStatus(request.getStatus());
        workflow.setTriggerCondition(request.getTriggerCondition());
        workflow.setAction(request.getAction());
        
        return toDto(workflowRepository.save(workflow));
    }

    public void deleteWorkflow(String id) {
        workflowRepository.deleteById(id);
    }

    private WorkflowDto toDto(Workflow workflow) {
        return WorkflowDto.builder()
                .id(workflow.getId())
                .name(workflow.getName())
                .description(workflow.getDescription())
                .status(workflow.getStatus())
                .triggerCondition(workflow.getTriggerCondition())
                .action(workflow.getAction())
                .createdAt(workflow.getCreatedAt())
                .updatedAt(workflow.getUpdatedAt())
                .build();
    }
}

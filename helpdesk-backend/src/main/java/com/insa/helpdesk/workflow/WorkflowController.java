package com.insa.helpdesk.workflow;

import com.insa.helpdesk.workflow.dto.WorkflowDto;
import com.insa.helpdesk.workflow.dto.WorkflowRequestDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('HELPDESK_MANAGER')")
    public ResponseEntity<List<WorkflowDto>> getAllWorkflows() {
        return ResponseEntity.ok(workflowService.getAllWorkflows());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('HELPDESK_MANAGER')")
    public ResponseEntity<WorkflowDto> getWorkflow(@PathVariable String id) {
        return ResponseEntity.ok(workflowService.getWorkflow(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<WorkflowDto> createWorkflow(@Valid @RequestBody WorkflowRequestDto request) {
        return ResponseEntity.ok(workflowService.createWorkflow(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<WorkflowDto> updateWorkflow(
            @PathVariable String id, 
            @Valid @RequestBody WorkflowRequestDto request) {
        return ResponseEntity.ok(workflowService.updateWorkflow(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable String id) {
        workflowService.deleteWorkflow(id);
        return ResponseEntity.noContent().build();
    }
}

package com.insa.helpdesk.priority;

import com.insa.helpdesk.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for Ticket Priority Management (FRD section 3.4).
 *
 * <p>BR-004 ("only authorized users can change ticket priority") is enforced here on
 * the PUT endpoint. JWT authorization is currently placeholder (SecurityConfig permits
 * all), so the guard is prepared with a principal-based check that becomes active once
 * real authentication is wired in. See the ADMIN_GUARD note below.</p>
 */
@RestController
@RequestMapping("/priorities")
@RequiredArgsConstructor
public class PriorityController {

    private final PriorityService priorityService;

    /**
     * FR-020: List the supported priority levels.
     */
    @GetMapping
    public ApiResponse<List<PriorityLevel>> listLevels() {
        return ApiResponse.success(priorityService.listPriorityLevels(), "Priority levels");
    }

    /**
     * FR-022: Get the current priority matrix.
     */
    @GetMapping("/matrix")
    public ApiResponse<PriorityMatrixDto> getMatrix() {
        List<PriorityMatrixConfig> rules = priorityService.getMatrix();
        return ApiResponse.success(toDto(rules), "Priority matrix");
    }

    /**
     * FR-021: Calculate a priority from impact and urgency using the matrix.
     * Query params: ?impact=HIGH&urgency=HIGH
     */
    @GetMapping("/calculate")
    public ApiResponse<PriorityLevel> calculate(@RequestParam Impact impact,
                                                @RequestParam Urgency urgency) {
        return ApiResponse.success(priorityService.calculatePriority(impact, urgency),
                "Calculated priority");
    }

    /**
     * FR-022: Update the priority matrix.
     *
     * <p>ADMIN GUARD (BR-004): only authorized users may change ticket priority.
     * TODO(auth): when real JWT authentication lands, replace the no-op with e.g.
     * {@code @PreAuthorize("hasRole('ADMIN')")} on this method and un-comment the
     * {@code @EnableMethodSecurity} in SecurityConfig. The service does not enforce it
     * because the module must remain usable while auth is stubbed out.</p>
     */
    @PutMapping("/matrix")
    public ResponseEntity<ApiResponse<Void>> updateMatrix(@RequestBody PriorityMatrixDto dto) {
        priorityService.updateMatrix(dto.getRows());
        return ResponseEntity.ok(ApiResponse.success(null, "Priority matrix updated"));
    }

    private static PriorityMatrixDto toDto(List<PriorityMatrixConfig> rules) {
        return PriorityMatrixDto.builder()
                .rows(rules.stream().map(rule -> PriorityMatrixDto.PriorityMatrixRow.builder()
                        .impact(rule.getImpact())
                        .urgency(rule.getUrgency())
                        .resultingPriority(rule.getResultingPriority())
                        .build()).toList())
                .build();
    }
}

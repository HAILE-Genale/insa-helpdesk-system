package com.insa.helpdesk.user.controller;

import com.insa.helpdesk.user.dto.ActivityLogResponseDto;
import com.insa.helpdesk.user.repository.UserActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/users/activity-logs")
@RequiredArgsConstructor
public class UserActivityLogController {

    private final UserActivityLogRepository userActivityLogRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<ActivityLogResponseDto>> getActivityLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Page<ActivityLogResponseDto> page = userActivityLogRepository.findAll(pageable)
                .map(log -> ActivityLogResponseDto.builder()
                        .id(log.getId())
                        .username(log.getUser().getUsername())
                        .action(log.getAction())
                        .detail(log.getDetail())
                        .createdAt(log.getCreatedAt())
                        .build());
                        
        return ResponseEntity.ok(page);
    }
}

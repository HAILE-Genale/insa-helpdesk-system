package com.insa.helpdesk.notification;

import com.insa.helpdesk.common.dto.ApiResponse;
import com.insa.helpdesk.common.security.UserPrincipal;
import com.insa.helpdesk.notification.dto.NotificationResponseDto;
import com.insa.helpdesk.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRealtimeService realtimeService;

    @GetMapping
    public ApiResponse<List<NotificationResponseDto>> recent(
            @RequestParam(defaultValue = "20") int limit,
            Authentication authentication) {

        User user = resolveUser(authentication);
        return ApiResponse.success(notificationService.getRecentForUser(user.getId(), limit), "Notifications");
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> unreadCount(Authentication authentication) {
        User user = resolveUser(authentication);
        return ApiResponse.success(Map.of("count", notificationService.getUnreadCount(user.getId())), "Unread count");
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<NotificationResponseDto> markRead(
            @PathVariable Long id,
            Authentication authentication) {

        User user = resolveUser(authentication);
        return ApiResponse.success(notificationService.markRead(id, user.getId()), "Notification marked as read");
    }

    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllRead(Authentication authentication) {
        User user = resolveUser(authentication);
        notificationService.markAllRead(user.getId());
        return ApiResponse.success(null, "Notifications marked as read");
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(Authentication authentication) {
        User user = resolveUser(authentication);
        return realtimeService.subscribe(user.getId());
    }

    private User resolveUser(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal up) {
            return up.getUser();
        }
        return User.builder().id(1L).username("system").build();
    }
}

package com.insa.helpdesk.knowledgebase;

import com.insa.helpdesk.common.dto.ApiResponse;
import com.insa.helpdesk.common.security.UserPrincipal;
import com.insa.helpdesk.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/knowledge-base")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KnowledgebaseController {

    private final KnowledgebaseService service;

    /**
     * GET /knowledge-base — public (authenticated).
     * Agents/managers see DRAFT+PUBLISHED; end users see PUBLISHED only.
     */
    @GetMapping
    public ApiResponse<List<KnowledgeArticleDto>> list(Authentication auth) {
        boolean canSeeDrafts = hasAnyRole(auth, "HELPDESK_AGENT", "HELPDESK_MANAGER", "SYSTEM_ADMIN");
        return ApiResponse.success(service.getAll(canSeeDrafts), "Articles");
    }

    /** GET /knowledge-base/my — articles authored by the current user. */
    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('KB_AUTHOR','KB_WRITE','KB_PUBLISH','USER_MANAGE')")
    public ApiResponse<List<KnowledgeArticleDto>> myArticles(Authentication auth) {
        User user = resolveUser(auth);
        return ApiResponse.success(service.getByAuthor(user.getId()), "My articles");
    }

    @GetMapping("/{id}")
    public ApiResponse<KnowledgeArticleDto> get(@PathVariable Long id) {
        return ApiResponse.success(service.getById(id), "Article");
    }

    /** POST — agents and above can create articles. */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('KB_AUTHOR','KB_WRITE','KB_PUBLISH','USER_MANAGE')")
    @Transactional
    public ApiResponse<KnowledgeArticleDto> create(@RequestBody KnowledgeArticleRequest req, Authentication auth) {
        return ApiResponse.success(service.create(req, resolveUser(auth)), "Article created");
    }

    /** PUT — author or admin can edit. */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('KB_AUTHOR','KB_WRITE','KB_PUBLISH','USER_MANAGE')")
    @Transactional
    public ApiResponse<KnowledgeArticleDto> update(@PathVariable Long id,
                                                    @RequestBody KnowledgeArticleRequest req,
                                                    Authentication auth) {
        return ApiResponse.success(service.update(id, req, resolveUser(auth)), "Article updated");
    }

    /** DELETE — admin only. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success(null, "Article deleted");
    }

    private User resolveUser(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) return up.getUser();
        throw new IllegalStateException("Not authenticated");
    }

    private boolean hasAnyRole(Authentication auth, String... roles) {
        if (auth == null) return false;
        for (String role : roles) {
            if (auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_" + role))) return true;
        }
        return false;
    }
}

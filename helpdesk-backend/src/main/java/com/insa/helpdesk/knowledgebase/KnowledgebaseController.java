package com.insa.helpdesk.knowledgebase;

import com.insa.helpdesk.common.dto.ApiResponse;
import com.insa.helpdesk.common.security.UserPrincipal;
import com.insa.helpdesk.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartException;

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
    @PreAuthorize("hasAnyAuthority('KB_AUTHOR','KB_WRITE','KB_PUBLISH','USER_MANAGE') or hasAnyRole('HELPDESK_AGENT','HELPDESK_MANAGER','SYSTEM_ADMIN')")
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
    @PreAuthorize("hasAnyAuthority('KB_AUTHOR','KB_WRITE','KB_PUBLISH','USER_MANAGE') or hasAnyRole('HELPDESK_AGENT','HELPDESK_MANAGER','SYSTEM_ADMIN')")
    @Transactional
    public ApiResponse<KnowledgeArticleDto> create(@RequestBody KnowledgeArticleRequest req, Authentication auth) {
        return ApiResponse.success(service.create(req, resolveUser(auth)), "Article created");
    }

    /** PUT — author or admin can edit. */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('KB_AUTHOR','KB_WRITE','KB_PUBLISH','USER_MANAGE') or hasAnyRole('HELPDESK_AGENT','HELPDESK_MANAGER','SYSTEM_ADMIN')")
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

    /** POST /knowledge-base/upload-image — upload an image for an article. */
    @PostMapping("/upload-image")
    @PreAuthorize("hasAnyAuthority('KB_AUTHOR','KB_WRITE','KB_PUBLISH','USER_MANAGE') or hasAnyRole('HELPDESK_AGENT','HELPDESK_MANAGER','SYSTEM_ADMIN')")
    public ApiResponse<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("No file selected");
            }
            String ext = getFileExtension(file.getOriginalFilename());
            if (!isAllowedImageType(ext)) {
                throw new IllegalArgumentException("Unsupported image type. Use JPG, PNG, GIF, or WebP.");
            }
            String filename = UUID.randomUUID().toString() + ext;
            Path dir = Paths.get("uploads/knowledge-articles").toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return ApiResponse.success("/uploads/knowledge-articles/" + filename, "Image uploaded");
        } catch (IOException e) {
            throw new MultipartException("Failed to store image: " + e.getMessage());
        }
    }

    private static boolean isAllowedImageType(String ext) {
        return ext.equals(".jpg") || ext.equals(".jpeg") || ext.equals(".png") || ext.equals(".gif") || ext.equals(".webp");
    }

    private static String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf(".")).toLowerCase();
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

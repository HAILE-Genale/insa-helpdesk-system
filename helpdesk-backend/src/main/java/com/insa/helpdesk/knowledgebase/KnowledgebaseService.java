package com.insa.helpdesk.knowledgebase;

import com.insa.helpdesk.common.dto.ApiResponse;
import com.insa.helpdesk.common.exception.ResourceNotFoundException;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KnowledgebaseService {

    private final KnowledgeArticleRepository repo;
    private final UserRepository userRepository;

    /** All articles — admins/managers see DRAFT + PUBLISHED; others see PUBLISHED only. */
    @Transactional(readOnly = true)
    public List<KnowledgeArticleDto> getAll(boolean includesDrafts) {
        List<KnowledgeArticle> articles = includesDrafts
                ? repo.findAllByOrderByCreatedAtDesc()
                : repo.findByStatusOrderByCreatedAtDesc("PUBLISHED");
        return articles.stream().map(this::toDto).toList();
    }

    /** Articles authored by a specific user. */
    @Transactional(readOnly = true)
    public List<KnowledgeArticleDto> getByAuthor(Long authorId) {
        return repo.findByAuthorIdOrderByCreatedAtDesc(authorId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public KnowledgeArticleDto getById(Long id) {
        KnowledgeArticle a = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
        a.setViews(a.getViews() + 1);
        repo.save(a);
        return toDto(a);
    }

    @Transactional
    public KnowledgeArticleDto create(KnowledgeArticleRequest req, User author) {
        User persistedAuthor = userRepository.findById(author.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        KnowledgeArticle article = KnowledgeArticle.builder()
                .title(req.getTitle())
                .problem(req.getProblem())
                .cause(req.getCause())
                .solution(req.getSolution())
                .category(req.getCategory())
                .department(req.getDepartment())
                .tags(req.getTags())
                .status(req.getStatus() != null ? req.getStatus() : "DRAFT")
                .author(persistedAuthor)
                .build();
        return toDto(repo.save(article));
    }

    @Transactional
    public KnowledgeArticleDto update(Long id, KnowledgeArticleRequest req, User editor) {
        KnowledgeArticle a = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
        if (req.getTitle()      != null) a.setTitle(req.getTitle());
        if (req.getProblem()    != null) a.setProblem(req.getProblem());
        if (req.getCause()      != null) a.setCause(req.getCause());
        if (req.getSolution()   != null) a.setSolution(req.getSolution());
        if (req.getCategory()   != null) a.setCategory(req.getCategory());
        if (req.getDepartment() != null) a.setDepartment(req.getDepartment());
        if (req.getTags()       != null) a.setTags(req.getTags());
        if (req.getStatus()     != null) a.setStatus(req.getStatus());
        return toDto(repo.save(a));
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Article not found: " + id);
        repo.deleteById(id);
    }

    private KnowledgeArticleDto toDto(KnowledgeArticle a) {
        return KnowledgeArticleDto.builder()
                .id(a.getId())
                .title(a.getTitle())
                .problem(a.getProblem())
                .cause(a.getCause())
                .solution(a.getSolution())
                .category(a.getCategory())
                .department(a.getDepartment())
                .tags(a.getTags())
                .status(a.getStatus())
                .authorId(a.getAuthor().getId())
                .authorName(a.getAuthor().getUsername())
                .views(a.getViews())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}

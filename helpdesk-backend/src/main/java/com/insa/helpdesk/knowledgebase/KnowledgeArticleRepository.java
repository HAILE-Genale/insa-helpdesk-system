package com.insa.helpdesk.knowledgebase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, Long> {
    List<KnowledgeArticle> findByStatusOrderByCreatedAtDesc(String status);
    List<KnowledgeArticle> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
    List<KnowledgeArticle> findAllByOrderByCreatedAtDesc();
}

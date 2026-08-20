package com.insa.helpdesk.knowledgebase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeArticleVoteRepository extends JpaRepository<KnowledgeArticleVote, Long> {
    List<KnowledgeArticleVote> findByArticleId(Long articleId);
    long countByArticleIdAndVoteType(Long articleId, String voteType);
    boolean existsByArticleIdAndUserId(Long articleId, Long userId);
    Optional<KnowledgeArticleVote> findByArticleIdAndUserId(Long articleId, Long userId);
    void deleteByArticleIdAndUserId(Long articleId, Long userId);
}

package com.insa.helpdesk.knowledgebase;

import com.insa.helpdesk.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

@Entity
@Table(name = "knowledge_articles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KnowledgeArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String problem;

    @Column(columnDefinition = "TEXT")
    private String cause;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String solution;

    private String category;
    private String department;
    private String tags;

    /** DRAFT or PUBLISHED */
    @Column(nullable = false)
    @Builder.Default
    private String status = "DRAFT";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Builder.Default
    private Long views = 0L;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = ZonedDateTime.now(); updatedAt = createdAt; }
    @PreUpdate   protected void onUpdate() { updatedAt = ZonedDateTime.now(); }
}

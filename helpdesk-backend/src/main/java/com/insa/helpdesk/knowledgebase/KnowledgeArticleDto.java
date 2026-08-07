package com.insa.helpdesk.knowledgebase;

import lombok.*;
import java.time.ZonedDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class KnowledgeArticleDto {
    private Long id;
    private String title;
    private String problem;
    private String cause;
    private String solution;
    private String category;
    private String department;
    private String tags;
    private String status;
    private Long authorId;
    private String authorName;
    private Long views;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}

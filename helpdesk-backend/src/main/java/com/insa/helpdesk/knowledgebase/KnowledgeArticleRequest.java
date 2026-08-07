package com.insa.helpdesk.knowledgebase;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class KnowledgeArticleRequest {
    private String title;
    private String problem;
    private String cause;
    private String solution;
    private String category;
    private String department;
    private String tags;
    private String status; // DRAFT or PUBLISHED
}

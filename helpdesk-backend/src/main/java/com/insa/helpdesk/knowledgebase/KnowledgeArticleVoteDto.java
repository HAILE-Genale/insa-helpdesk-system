package com.insa.helpdesk.knowledgebase;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeArticleVoteDto {
    private Long articleId;
    private Long userId;
    private String voteType;
    private long likeCount;
    private long dislikeCount;
}
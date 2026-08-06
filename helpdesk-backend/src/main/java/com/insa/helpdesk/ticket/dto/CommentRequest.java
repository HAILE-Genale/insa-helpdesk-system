package com.insa.helpdesk.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    private String content;
    /** true = internal note (agents only), false = reply visible to requester */
    private boolean internal;
}

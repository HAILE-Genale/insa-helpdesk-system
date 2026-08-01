package com.insa.helpdesk.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String tokenHash;

    @Column(nullable = false)
    private java.time.OffsetDateTime expiresAt;

    @Column
    private java.time.OffsetDateTime usedAt;

    @Column(nullable = false, updatable = false)
    private java.time.OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.OffsetDateTime.now();
    }
}

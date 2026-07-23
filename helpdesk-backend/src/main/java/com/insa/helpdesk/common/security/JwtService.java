package com.insa.helpdesk.common.security;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

    public String generateToken(String username) {
        return "placeholder-jwt-token";
    }

    public String extractUsername(String token) {
        return "placeholder-user";
    }

    public boolean isTokenValid(String token, String username) {
        return true;
    }
}

package com.insa.helpdesk.user.service;

import com.insa.helpdesk.common.security.JwtService;
import com.insa.helpdesk.user.dto.CreateUserRequest;
import com.insa.helpdesk.user.dto.LoginRequest;
import com.insa.helpdesk.user.dto.LoginResponseDto;
import com.insa.helpdesk.user.dto.UserResponseDto;
import com.insa.helpdesk.user.dto.UpdateUserRequest;
import com.insa.helpdesk.user.entity.Role;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.entity.UserActivityLog;
import com.insa.helpdesk.user.entity.PasswordResetToken;
import com.insa.helpdesk.user.repository.UserRepository;
import com.insa.helpdesk.user.repository.RoleRepository;
import com.insa.helpdesk.user.repository.UserActivityLogRepository;
import com.insa.helpdesk.user.repository.PasswordResetTokenRepository;
import com.insa.helpdesk.common.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserActivityLogRepository activityLogRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    @Value("${app.mail.frontend-base-url}")
    private String frontendBaseUrl;

    private void logActivity(User user, String action, String detail) {
        activityLogRepository.save(
            UserActivityLog.builder().user(user).action(action).detail(detail).build()
        );
    }

    public UserResponseDto createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Role role = roleRepository.findByName(request.getRole().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Unknown role: " + request.getRole()));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .phone(request.getPhone())
                .location(request.getLocation())
                .active(true)
                .build();

        User saved = userRepository.save(user);
        logActivity(saved, "USER_CREATED", "User registered");
        return toDto(saved);
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return toDto(user);
    }

    public UserResponseDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        User saved = userRepository.save(user);
        logActivity(saved, "PROFILE_UPDATED", "Profile fields updated");
        return toDto(saved);
    }

    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setActive(false);
        userRepository.save(user);
        logActivity(user, "DEACTIVATED", "User account deactivated");
    }

    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setActive(true);
        userRepository.save(user);
        logActivity(user, "ACTIVATED", "User account activated");
    }

    public LoginResponseDto login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String token = jwtService.generateToken(user.getUsername());
        logActivity(user, "LOGIN", "User logged in");
        return LoginResponseDto.builder().token(token).user(toDto(user)).build();
    }

    public String initiatePasswordReset(String email) {
        java.util.Optional<User> optUser = userRepository.findByEmail(email);
        if (optUser.isPresent()) {
            User user = optUser.get();
            String rawToken = java.util.UUID.randomUUID().toString();
            String tokenHash = passwordEncoder.encode(rawToken);
            passwordResetTokenRepository.save(PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(tokenHash)
                    .expiresAt(java.time.OffsetDateTime.now().plusHours(1))
                    .build());
            logActivity(user, "PASSWORD_RESET_REQUESTED", "Reset token issued");

            String resetLink = frontendBaseUrl + "/reset-password?token=" + rawToken;
            String emailBody = "You requested a password reset for your INSA Help Desk account. "
                    + "Click the link below within 1 hour to reset it:\n"
                    + resetLink + "\n\n"
                    + "If you didn't request this, ignore this email.";
            emailService.send(user.getEmail(), "INSA Help Desk — Password Reset", emailBody);
        }
        return "If an account with that email exists, a password reset link has been sent.";
    }

    public void completePasswordReset(String rawToken, String newPassword) {
        var match = passwordResetTokenRepository.findAll().stream()
                .filter(t -> t.getUsedAt() == null && t.getExpiresAt().isAfter(java.time.OffsetDateTime.now()))
                .filter(t -> passwordEncoder.matches(rawToken, t.getTokenHash()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
        User user = match.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        match.setUsedAt(java.time.OffsetDateTime.now());
        passwordResetTokenRepository.save(match);
        logActivity(user, "PASSWORD_RESET_COMPLETED", "Password reset via token");
    }

    private UserResponseDto toDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .phone(user.getPhone())
                .location(user.getLocation())
                .active(user.isActive())
                .build();
    }
}
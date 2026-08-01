package com.insa.helpdesk.user.service;

import com.insa.helpdesk.common.security.JwtService;
import com.insa.helpdesk.user.dto.CreateUserRequest;
import com.insa.helpdesk.user.dto.LoginRequest;
import com.insa.helpdesk.user.dto.LoginResponseDto;
import com.insa.helpdesk.user.dto.UserResponseDto;
import com.insa.helpdesk.user.entity.Role;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.UserRepository;
import com.insa.helpdesk.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    // Every field below is `final` — Lombok's @RequiredArgsConstructor generates
    // a constructor taking all of these, in this order, automatically.
    // You never write the constructor yourself.
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

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
                .active(true)
                .build();

        User saved = userRepository.save(user);
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

    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setActive(false);
        userRepository.save(user);
    }

    public LoginResponseDto login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String token = jwtService.generateToken(user.getUsername());
        return LoginResponseDto.builder().token(token).user(toDto(user)).build();
    }

    private UserResponseDto toDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .build();
    }
}
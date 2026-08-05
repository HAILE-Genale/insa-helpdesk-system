package com.insa.helpdesk.config;

import com.insa.helpdesk.user.entity.Role;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.RoleRepository;
import com.insa.helpdesk.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Order(2)
public class UserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            Optional<Role> adminRoleOpt = roleRepository.findByName("SYSTEM_ADMIN");
            
            if (adminRoleOpt.isPresent()) {
                User admin = User.builder()
                        .username("admin")
                        .email("admin@insa.gov.et")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .role(adminRoleOpt.get())
                        .build();
                userRepository.save(admin);
                System.out.println("=========================================================");
                System.out.println("Admin user created with username: admin, password: admin123");
                System.out.println("=========================================================");
            } else {
                System.out.println("SYSTEM_ADMIN role not found. Run RoleSeeder first.");
            }
        }
    }
}

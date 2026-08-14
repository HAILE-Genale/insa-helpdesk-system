package com.insa.helpdesk.config;

import com.insa.helpdesk.user.entity.Department;
import com.insa.helpdesk.user.entity.Role;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.DepartmentRepository;
import com.insa.helpdesk.user.repository.RoleRepository;
import com.insa.helpdesk.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Order(2)
public class UserSeeder implements CommandLineRunner {

    private final UserRepository       userRepository;
    private final RoleRepository       roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder      passwordEncoder;

    @Override
    public void run(String... args) {

        // Ensure core departments exist
        Department itDept  = ensureDept("IT & Infrastructure");
        Department noc     = ensureDept("Network Operations");
        Department hrDept  = ensureDept("Human Resources");

        // ── admin ──────────────────────────────────────────────────────
        seedUser("admin", "admin@insa.gov.et", "admin123",
                 "SYSTEM_ADMIN", itDept, null,
                 "Admin account (full access)");

        // ── test agent ─────────────────────────────────────────────────
        seedUser("agent.test", "agent.test@insa.gov.et", "Agent@1234",
                 "HELPDESK_AGENT", noc, List.of("Network & VPN", "Hardware"),
                 "Test helpdesk agent — Network Operations");

        // ── test helpdesk manager ──────────────────────────────────────
        seedUser("manager.test", "manager.test@insa.gov.et", "Manager@1234",
                 "HELPDESK_MANAGER", itDept, null,
                 "Test helpdesk manager — IT Infrastructure");
    }

    // ── helpers ───────────────────────────────────────────────────────

    private Department ensureDept(String name) {
        return departmentRepository.findByName(name)
                .orElseGet(() -> departmentRepository.save(
                        Department.builder().name(name).build()));
    }

    private void seedUser(String username, String email, String password,
                          String roleName, Department dept,
                          List<String> expertise, String logLabel) {
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            boolean changed = false;

            if (!passwordEncoder.matches(password, user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode(password));
                changed = true;
            }
            if (!user.isActive()) {
                user.setActive(true);
                changed = true;
            }

            if (changed) {
                userRepository.save(user);
                System.out.println("Updated seeded login: " + username + " / " + password + "  [" + logLabel + "]");
            }
            return;
        }

        Optional<Role> roleOpt = roleRepository.findByName(roleName);
        if (roleOpt.isEmpty()) {
            System.out.println("⚠️  Role " + roleName + " not found — skipping user: " + username);
            return;
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(roleOpt.get())
                .department(dept)
                .expertise(expertise != null ? expertise : new java.util.ArrayList<>())
                .active(true)
                .build();

        userRepository.save(user);
        System.out.println("=================================================");
        System.out.println("Seeded: " + username + " / " + password + "  [" + logLabel + "]");
        System.out.println("=================================================");
    }
}

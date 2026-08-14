package com.insa.helpdesk.config;

import com.insa.helpdesk.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(3)
public class DemoSeedLoginRepair implements CommandLineRunner {

    private static final String DEMO_AGENT_PASSWORD = "Agent@1234";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        repairExistingSeededLogin("abebe.bikila", DEMO_AGENT_PASSWORD);
        repairExistingSeededLogin("tigist.alemu", DEMO_AGENT_PASSWORD);
        repairExistingSeededLogin("dawit.isaac", DEMO_AGENT_PASSWORD);
        repairExistingSeededLogin("sara.hailu", DEMO_AGENT_PASSWORD);
        repairExistingSeededLogin("yonas.tadesse", DEMO_AGENT_PASSWORD);
        repairExistingSeededLogin("selam.bekele", DEMO_AGENT_PASSWORD);
    }

    private void repairExistingSeededLogin(String username, String password) {
        userRepository.findByUsername(username).ifPresent(user -> {
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
                System.out.println("Updated demo seeded login: " + username + " / " + password);
            }
        });
    }
}

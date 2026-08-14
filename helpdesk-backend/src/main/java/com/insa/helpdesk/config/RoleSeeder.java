package com.insa.helpdesk.config;

import com.insa.helpdesk.user.entity.Permission;
import com.insa.helpdesk.user.entity.Role;
import com.insa.helpdesk.user.repository.PermissionRepository;
import com.insa.helpdesk.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.core.annotation.Order;

@Component
@RequiredArgsConstructor
@Order(1)
public class RoleSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public void run(String... args) {
        if (permissionRepository.count() == 0) {
            List<Permission> permissions = Arrays.asList(
                    Permission.builder().code("USER_MANAGE").description("Manage users").build(),
                    Permission.builder().code("TICKET_CREATE").description("Create tickets").build(),
                    Permission.builder().code("TICKET_VIEW").description("View own tickets").build(),
                    Permission.builder().code("TICKET_UPDATE").description("Update tickets").build(),
                    Permission.builder().code("TICKET_MANAGE").description("Manage and update any ticket status").build(),
                    Permission.builder().code("TICKET_COMMENT").description("Add comments to tickets").build(),
                    Permission.builder().code("TICKET_PRIORITY_CHANGE").description("Change ticket priority").build(),
                    Permission.builder().code("TICKET_REOPEN_CLOSED").description("Reopen closed tickets").build(),
                    Permission.builder().code("CATEGORY_MANAGE").description("Manage categories").build(),
                    Permission.builder().code("KB_AUTHOR").description("Author knowledge base articles").build(),
                    Permission.builder().code("KB_PUBLISH").description("Publish knowledge base articles").build(),
                    Permission.builder().code("REPORTING_VIEW").description("View reports").build(),
                    Permission.builder().code("TICKET_ASSIGN").description("Assign and reassign tickets").build(),
                    Permission.builder().code("TEAM_MANAGE").description("Manage support teams and routing rules").build()
            );
            permissionRepository.saveAll(permissions);
        }

        if (roleRepository.count() == 0) {
            List<Permission> allPerms = permissionRepository.findAll();

            Set<Permission> systemAdminPerms = Set.copyOf(allPerms);

            Set<Permission> helpdeskManagerPerms = allPerms.stream()
                    .filter(p -> List.of("TICKET_VIEW", "TICKET_UPDATE", "TICKET_MANAGE", "TICKET_COMMENT",
                            "TICKET_PRIORITY_CHANGE", "TICKET_REOPEN_CLOSED", "REPORTING_VIEW",
                            "TICKET_ASSIGN", "TEAM_MANAGE", "KB_AUTHOR", "KB_PUBLISH").contains(p.getCode()))
                    .collect(Collectors.toSet());

            Set<Permission> helpdeskAgentPerms = allPerms.stream()
                    .filter(p -> List.of("TICKET_CREATE", "TICKET_VIEW", "TICKET_UPDATE",
                            "TICKET_MANAGE", "TICKET_COMMENT", "TICKET_ASSIGN", "KB_AUTHOR", "KB_PUBLISH").contains(p.getCode()))
                    .collect(Collectors.toSet());

            Set<Permission> endUserPerms = allPerms.stream()
                    .filter(p -> List.of("TICKET_CREATE", "TICKET_VIEW", "TICKET_COMMENT").contains(p.getCode()))
                    .collect(Collectors.toSet());

            Set<Permission> departmentManagerPerms = allPerms.stream()
                    .filter(p -> List.of("TICKET_VIEW", "REPORTING_VIEW").contains(p.getCode()))
                    .collect(Collectors.toSet());

            Set<Permission> knowledgeManagerPerms = allPerms.stream()
                    .filter(p -> List.of("KB_AUTHOR", "KB_PUBLISH").contains(p.getCode()))
                    .collect(Collectors.toSet());

            roleRepository.save(Role.builder().name("SYSTEM_ADMIN").description("System Administrator").permissions(systemAdminPerms).build());
            roleRepository.save(Role.builder().name("HELPDESK_MANAGER").description("Helpdesk Manager").permissions(helpdeskManagerPerms).build());
            roleRepository.save(Role.builder().name("HELPDESK_AGENT").description("Helpdesk Agent").permissions(helpdeskAgentPerms).build());
            roleRepository.save(Role.builder().name("END_USER").description("End User").permissions(endUserPerms).build());
            roleRepository.save(Role.builder().name("DEPARTMENT_MANAGER").description("Department Manager").permissions(departmentManagerPerms).build());
            roleRepository.save(Role.builder().name("KNOWLEDGE_MANAGER").description("Knowledge Manager").permissions(knowledgeManagerPerms).build());
        } else {
            // Ensure new permissions exist and are assigned to existing roles.
            ensurePermissionExists("TICKET_VIEW", "View own tickets", allPerms -> allPerms);
            ensurePermissionExists("TICKET_MANAGE", "Manage and update any ticket status", allPerms -> allPerms);
            ensurePermissionExists("TICKET_COMMENT", "Add comments to tickets", allPerms -> allPerms);
        }

        ensureRoleHasPermissions("HELPDESK_AGENT", "KB_AUTHOR", "KB_PUBLISH");
        ensureRoleHasPermissions("HELPDESK_MANAGER", "KB_AUTHOR", "KB_PUBLISH");
    }

    private void ensurePermissionExists(String code, String description, java.util.function.Function<List<Permission>, List<Permission>> ignore) {
        if (permissionRepository.findByCode(code).isEmpty()) {
            permissionRepository.save(Permission.builder().code(code).description(description).build());
        }
    }

    private void ensureRoleHasPermissions(String roleName, String... permissionCodes) {
        roleRepository.findByName(roleName).ifPresent(role -> {
            boolean changed = false;
            for (String code : permissionCodes) {
                Permission permission = permissionRepository.findByCode(code)
                        .orElseThrow(() -> new IllegalStateException("Missing permission: " + code));
                if (role.getPermissions().add(permission)) {
                    changed = true;
                }
            }
            if (changed) {
                roleRepository.save(role);
            }
        });
    }
}

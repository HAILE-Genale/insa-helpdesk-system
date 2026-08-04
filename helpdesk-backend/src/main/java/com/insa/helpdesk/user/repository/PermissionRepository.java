package com.insa.helpdesk.user.repository;

import com.insa.helpdesk.user.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
}

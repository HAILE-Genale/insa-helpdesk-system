package com.insa.helpdesk.user.repository;

import com.insa.helpdesk.user.entity.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {
}

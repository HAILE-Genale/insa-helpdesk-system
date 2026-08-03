package com.insa.helpdesk.classification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ClassificationRepo extends JpaRepository<Classification, Long> {

}
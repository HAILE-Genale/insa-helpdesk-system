package com.insa.helpdesk.classification;

import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class ClassificationService {


    private final ClassificationRepo classificationRepo;


    public ClassificationService(ClassificationRepo classificationRepo) {
        this.classificationRepo = classificationRepo;
    }



    public Classification createClassification(Classification classification) {

        return classificationRepo.save(classification);

    }



    public List<Classification> getClassifications() {

        return classificationRepo.findAll();

    }



    public Classification updateClassification(Long id, Classification classification) {


        Classification existing = classificationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Classification not found"));


        existing.setName(classification.getName());
        existing.setDescription(classification.getDescription());
        existing.setActive(classification.getActive());


        return classificationRepo.save(existing);

    }



    public void deleteClassification(Long id) {


        Classification classification = classificationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Classification not found"));


        classificationRepo.delete(classification);

    }

}
package com.insa.helpdesk.classification;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/classification")
public class ClassificationController {


    private final ClassificationService classificationService;


    public ClassificationController(ClassificationService classificationService) {

        this.classificationService = classificationService;

    }



    @PostMapping
    public Classification createClassification(
            @RequestBody Classification classification
    ) {

        return classificationService.createClassification(classification);

    }



    @GetMapping
    public List<Classification> getClassifications() {

        return classificationService.getClassifications();

    }



    @PutMapping("/{id}")
    public Classification updateClassification(
            @PathVariable Long id,
            @RequestBody Classification classification
    ) {

        return classificationService.updateClassification(id, classification);

    }



    @DeleteMapping("/{id}")
    public void deleteClassification(
            @PathVariable Long id
    ) {

        classificationService.deleteClassification(id);

    }

}
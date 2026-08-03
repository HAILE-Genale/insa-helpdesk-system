package com.insa.helpdesk.Category;

import com.insa.helpdesk.classification.Classification;
import com.insa.helpdesk.classification.ClassificationRepo;
import com.insa.helpdesk.dto.CategoryRequestDTO;
import com.insa.helpdesk.dto.CategoryResponseDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepo categoryRepo;
    private final ClassificationRepo classificationRepo;

    public CategoryService(CategoryRepo categoryRepo,
                           ClassificationRepo classificationRepo) {

        this.categoryRepo = categoryRepo;
        this.classificationRepo = classificationRepo;
    }

    public CategoryResponseDTO createCategory(CategoryRequestDTO dto) {

        Classification classification = classificationRepo.findById(dto.getClassificationId())
                .orElseThrow(() -> new RuntimeException("Classification not found"));

        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setActive(dto.getActive());
        category.setClassification(classification);

        Category saved = categoryRepo.save(category);

        return mapToResponse(saved);
    }

    public List<Category> getCategories() {
        return categoryRepo.findAll();
    }

    public Category updateCategory(Long id, Category category) {

        Category existingCategory = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        existingCategory.setName(category.getName());
        existingCategory.setDescription(category.getDescription());
        existingCategory.setActive(category.getActive());
        existingCategory.setClassification(category.getClassification());

        return categoryRepo.save(existingCategory);
    }

    public void deleteCategory(Long id) {

        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        categoryRepo.delete(category);
    }

    private CategoryResponseDTO mapToResponse(Category category) {

        CategoryResponseDTO dto = new CategoryResponseDTO();

        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setActive(category.getActive());

        if (category.getClassification() != null) {
            dto.setClassificationName(category.getClassification().getName());
        }

        return dto;
    }
}
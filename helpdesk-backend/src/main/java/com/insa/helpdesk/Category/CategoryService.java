package com.insa.helpdesk.Category;

import com.insa.helpdesk.classification.Classification;
import com.insa.helpdesk.classification.ClassificationRepo;
import com.insa.helpdesk.dto.CategoryRequestDTO;
import com.insa.helpdesk.dto.CategoryResponseDTO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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

        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setActive(dto.getActive() != null ? dto.getActive() : true);

        if (dto.getClassificationId() != null) {
            Classification classification = classificationRepo.findById(dto.getClassificationId())
                    .orElseThrow(() -> new RuntimeException("Classification not found"));
            category.setClassification(classification);
        }

        Category saved = categoryRepo.save(category);

        return mapToResponse(saved);
    }

    public List<CategoryResponseDTO> getCategories() {
        return categoryRepo.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO dto) {

        Category existingCategory = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (dto.getClassificationId() != null) {
            Classification classification = classificationRepo.findById(dto.getClassificationId())
                    .orElseThrow(() -> new RuntimeException("Classification not found"));
            existingCategory.setClassification(classification);
        } else {
            existingCategory.setClassification(null);
        }

        existingCategory.setName(dto.getName());
        existingCategory.setDescription(dto.getDescription());
        existingCategory.setActive(dto.getActive() != null ? dto.getActive() : existingCategory.getActive());

        return mapToResponse(categoryRepo.save(existingCategory));
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
            dto.setClassificationId(category.getClassification().getId());
            dto.setClassificationName(category.getClassification().getName());
        }

        return dto;
    }
}
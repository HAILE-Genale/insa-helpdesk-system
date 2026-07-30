package com.insa.helpdesk.Category;

import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class CategoryService {


    private final CategoryRepo categoryRepo;


    public CategoryService(CategoryRepo categoryRepo) {
        this.categoryRepo = categoryRepo;
    }



    public Category createCategory(Category category) {

        return categoryRepo.save(category);

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


        return categoryRepo.save(existingCategory);

    }




    public void deleteCategory(Long id) {

        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));


        categoryRepo.delete(category);

    }

}

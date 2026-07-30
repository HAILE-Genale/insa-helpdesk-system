package com.insa.helpdesk.Category;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/category")
public class CategoryController {


    private final CategoryService categoryService;


    public CategoryController(CategoryService categoryService) {

        this.categoryService = categoryService;

    }



    @PostMapping
    public Category createCategory(@RequestBody Category category) {

        return categoryService.createCategory(category);

    }



    @GetMapping
    public List<Category> getCategories() {

        return categoryService.getCategories();

    }



    @PutMapping("/{id}")
    public Category updateCategory(
            @PathVariable Long id,
            @RequestBody Category category
    ) {

        return categoryService.updateCategory(id, category);

    }



    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {

        categoryService.deleteCategory(id);

    }

}

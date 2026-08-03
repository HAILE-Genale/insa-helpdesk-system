package com.insa.helpdesk.Category;

import com.insa.helpdesk.dto.CategoryRequestDTO;
import com.insa.helpdesk.dto.CategoryResponseDTO;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<CategoryResponseDTO> createCategory(
            @RequestBody CategoryRequestDTO dto) {

        return ResponseEntity.ok(categoryService.createCategory(dto));
    }

    @GetMapping
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryService.getCategories());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category) {

        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {

        categoryService.deleteCategory(id);

        return ResponseEntity.ok("Category deleted successfully.");
    }
}
package com.insa.helpdesk.Category;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.insa.helpdesk.classification.Classification;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category {

    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Getter
    @Column(nullable = false)
    private String name;

    @Setter
    @Getter
    private String description;

    @Getter
    @Setter
    private Boolean active = true;

    @Setter
    @Getter
    @ManyToOne
    @JoinColumn(name = "parent_category_id")
    @JsonIgnore
    private Category parentCategory;

    @Setter
    @Getter
    @OneToMany(mappedBy = "parentCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> subCategories = new ArrayList<>();

    @Setter
    @Getter
    @ManyToOne
    @JoinColumn(name = "classification_id")
    private Classification classification;

    public Category() {
    }

    public Category(String name, String description, Boolean active) {
        this.name = name;
        this.description = description;
        this.active = active;
    }

}

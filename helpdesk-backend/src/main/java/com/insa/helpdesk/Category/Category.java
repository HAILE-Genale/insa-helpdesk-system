package com.insa.helpdesk.Category;

import com.insa.helpdesk.classification.Classification;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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


    public Category() {
    }


    public Category(String name, String description, Boolean active) {
        this.name = name;
        this.description = description;
        this.active = active;
    }
    @Setter
    @Getter
    @ManyToOne
    @JoinColumn(name = "classification_id")
    private Classification classification;


}

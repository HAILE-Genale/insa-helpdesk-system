package com.insa.helpdesk.classification;

import jakarta.persistence.*;

@Entity
@Table(name = "classifications")
public class Classification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    private Boolean active = true;


    public Classification() {
    }


    public Classification(String name, String description, Boolean active) {
        this.name = name;
        this.description = description;
        this.active = active;
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(String description) {
        this.description = description;
    }


    public Boolean getActive() {
        return active;
    }


    public void setActive(Boolean active) {
        this.active = active;
    }
}

package com.voting.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "candidates")
@Data
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String party;

    @Column(columnDefinition = "TEXT")
    private String description;

    private int votes = 0;
}

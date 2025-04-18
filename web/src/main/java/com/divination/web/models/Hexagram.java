package com.divination.web.models;

import jakarta.persistence.*;

@Entity
@Table(name = "hexagram")
public class Hexagram{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
}
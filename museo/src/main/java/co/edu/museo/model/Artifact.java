package co.edu.museo.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Objeto (pieza) del museo. El artista es opcional: máximo uno por objeto. */
@Entity
@Table(name = "artifact")
public class Artifact extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    @Column(nullable = false)
    public String name;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(name = "image_url")
    public String imageUrl;

    @Column(name = "created_at")
    public LocalDateTime createdAt;

    @Column(name = "acquired_at")
    public LocalDateTime acquiredAt;

    @Column(name = "condition_percentage")
    public Integer conditionPercentage;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id")
    public Category category;

    @ManyToOne
    @JoinColumn(name = "artist_id")
    public Artist artist;

    /** Sala donde se encuentra actualmente. */
    @ManyToOne
    @JoinColumn(name = "exhibition_room_id")
    public ExhibitionRoom exhibitionRoom;
}

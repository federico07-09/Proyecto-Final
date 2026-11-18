package co.edu.museo.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Historial de exposición: en qué sala estuvo un objeto y durante qué periodo. */
@Entity
@Table(name = "artifact_exhibition")
public class ArtifactExhibition extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "artifact_id")
    public Artifact artifact;

    @ManyToOne(optional = false)
    @JoinColumn(name = "exhibition_room_id")
    public ExhibitionRoom exhibitionRoom;

    @Column(name = "start_date", nullable = false)
    public LocalDateTime startDate;

    /** null = sigue expuesto en esa sala. */
    @Column(name = "end_date")
    public LocalDateTime endDate;
}

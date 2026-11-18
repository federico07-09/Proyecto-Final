package co.edu.museo.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tour")
public class Tour extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    @Column(nullable = false)
    public String name;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(name = "start_at")
    public LocalDateTime startAt;

    @Column(name = "end_at")
    public LocalDateTime endAt;

    @Column(name = "landing_page_url")
    public String landingPageUrl;

    /** Salas del recorrido, ordenadas por sequence_number. */
    @OneToMany(mappedBy = "tour", fetch = FetchType.EAGER)
    @OrderBy("sequenceNumber ASC")
    public List<TourRoom> rooms;
}

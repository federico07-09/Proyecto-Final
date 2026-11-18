package co.edu.museo.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "exhibition_room")
public class ExhibitionRoom extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "museum_id")
    public Museum museum;

    @Column(nullable = false)
    public String name;

    @Column(columnDefinition = "TEXT")
    public String description;

    public Integer capacity;
}

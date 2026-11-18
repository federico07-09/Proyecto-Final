package co.edu.museo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

/** Tabla intermedia visita - sala, con el orden del recorrido. */
@Entity
@Table(name = "tour_room")
public class TourRoom extends PanacheEntityBase {
    @EmbeddedId
    public TourRoomId id;

    @ManyToOne
    @MapsId("tourId")
    @JoinColumn(name = "tour_id")
    @JsonIgnore
    public Tour tour;

    @ManyToOne
    @MapsId("exhibitionRoomId")
    @JoinColumn(name = "exhibition_room_id")
    public ExhibitionRoom exhibitionRoom;

    @Column(name = "sequence_number", nullable = false)
    public Integer sequenceNumber;
}

package co.edu.museo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class TourRoomId implements Serializable {
    @Column(name = "tour_id")
    public Integer tourId;

    @Column(name = "exhibition_room_id")
    public Integer exhibitionRoomId;

    public TourRoomId() {}

    public TourRoomId(Integer tourId, Integer exhibitionRoomId) {
        this.tourId = tourId;
        this.exhibitionRoomId = exhibitionRoomId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TourRoomId)) return false;
        TourRoomId that = (TourRoomId) o;
        return Objects.equals(tourId, that.tourId) && Objects.equals(exhibitionRoomId, that.exhibitionRoomId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tourId, exhibitionRoomId);
    }
}

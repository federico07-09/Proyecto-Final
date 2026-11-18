package co.edu.museo.resource;

import co.edu.museo.model.ExhibitionRoom;
import co.edu.museo.model.Tour;
import co.edu.museo.model.TourRoom;
import co.edu.museo.model.TourRoomId;
import co.edu.museo.util.Errores;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Path("/api/tours")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TourResource {

    /** Datos que envía el formulario: "rooms" son los ids de las salas, en el orden del recorrido. */
    public static class TourSolicitud {
        public String name;
        public String description;
        public LocalDateTime startAt;
        public LocalDateTime endAt;
        public String landingPageUrl;
        public List<Integer> rooms;
    }

    @GET
    public List<Tour> listar() {
        return Tour.list("order by startAt desc, name");
    }

    @GET
    @Path("/{id}")
    public Tour obtener(@PathParam("id") Integer id) {
        Tour t = Tour.findById(id);
        if (t == null) throw Errores.noEncontrado("La visita guiada no existe.");
        return t;
    }

    @POST
    @Transactional
    public Response crear(TourSolicitud s) {
        validar(s);
        Tour t = new Tour();
        copiar(t, s);
        t.persist();
        sincronizarSalas(t, s.rooms);
        return Response.status(Response.Status.CREATED).entity(Map.of("id", t.id)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response actualizar(@PathParam("id") Integer id, TourSolicitud s) {
        validar(s);
        Tour t = Tour.findById(id);
        if (t == null) throw Errores.noEncontrado("La visita guiada no existe.");
        copiar(t, s);
        sincronizarSalas(t, s.rooms);
        return Response.ok(Map.of("id", t.id)).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response eliminar(@PathParam("id") Integer id) {
        TourRoom.delete("id.tourId", id);
        if (!Tour.deleteById(id)) throw Errores.noEncontrado("La visita guiada no existe.");
        return Response.noContent().build();
    }

    private void copiar(Tour t, TourSolicitud s) {
        t.name = s.name;
        t.description = s.description;
        t.startAt = s.startAt;
        t.endAt = s.endAt;
        t.landingPageUrl = s.landingPageUrl;
    }

    /** Deja en la visita exactamente las salas indicadas, numeradas según su posición en la lista. */
    private void sincronizarSalas(Tour t, List<Integer> ids) {
        Map<Integer, TourRoom> actuales = new HashMap<>();
        if (t.rooms != null) {
            for (TourRoom tr : t.rooms) {
                actuales.put(tr.exhibitionRoom.id, tr);
            }
        }
        Set<Integer> nuevas = new HashSet<>(ids);
        for (Map.Entry<Integer, TourRoom> e : actuales.entrySet()) {
            if (!nuevas.contains(e.getKey())) {
                e.getValue().delete();
            }
        }
        int orden = 1;
        for (Integer roomId : ids) {
            TourRoom tr = actuales.get(roomId);
            if (tr != null) {
                tr.sequenceNumber = orden;
            } else {
                ExhibitionRoom sala = ExhibitionRoom.findById(roomId);
                if (sala == null) throw Errores.noEncontrado("La sala " + roomId + " no existe.");
                TourRoom nuevo = new TourRoom();
                nuevo.id = new TourRoomId(t.id, sala.id);
                nuevo.tour = t;
                nuevo.exhibitionRoom = sala;
                nuevo.sequenceNumber = orden;
                nuevo.persist();
            }
            orden++;
        }
    }

    private void validar(TourSolicitud s) {
        if (s == null) throw Errores.peticionInvalida("Faltan los datos de la visita guiada.");
        Errores.exigirTexto(s.name, "nombre");
        if (s.startAt != null && s.endAt != null && s.endAt.isBefore(s.startAt)) {
            throw Errores.peticionInvalida("La fecha de fin no puede ser anterior a la de inicio.");
        }
        if (s.rooms == null || s.rooms.isEmpty()) {
            throw Errores.peticionInvalida("La visita debe incluir al menos una sala.");
        }
        if (new HashSet<>(s.rooms).size() != s.rooms.size()) {
            throw Errores.peticionInvalida("Una sala no puede repetirse dentro del mismo recorrido.");
        }
    }
}

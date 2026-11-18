package co.edu.museo.resource;

import co.edu.museo.model.Artifact;
import co.edu.museo.model.ArtifactExhibition;
import co.edu.museo.model.ExhibitionRoom;
import co.edu.museo.model.Museum;
import co.edu.museo.model.TourRoom;
import co.edu.museo.util.Errores;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/rooms")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RoomResource {

    @GET
    public List<ExhibitionRoom> listar(@QueryParam("museumId") Integer museumId) {
        if (museumId != null) {
            return ExhibitionRoom.list("museum.id = ?1 order by name", museumId);
        }
        return ExhibitionRoom.list("order by museum.name, name");
    }

    @GET
    @Path("/{id}")
    public ExhibitionRoom obtener(@PathParam("id") Integer id) {
        ExhibitionRoom r = ExhibitionRoom.findById(id);
        if (r == null) throw Errores.noEncontrado("La sala no existe.");
        return r;
    }

    /** Objetos que están actualmente en la sala. */
    @GET
    @Path("/{id}/artifacts")
    public List<Artifact> objetos(@PathParam("id") Integer id) {
        return Artifact.list("exhibitionRoom.id = ?1 order by name", id);
    }

    @POST
    @Transactional
    public Response crear(ExhibitionRoom datos) {
        validar(datos);
        datos.id = null;
        datos.museum = resolverMuseo(datos);
        datos.persist();
        return Response.status(Response.Status.CREATED).entity(datos).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public ExhibitionRoom actualizar(@PathParam("id") Integer id, ExhibitionRoom datos) {
        validar(datos);
        ExhibitionRoom r = ExhibitionRoom.findById(id);
        if (r == null) throw Errores.noEncontrado("La sala no existe.");
        r.museum = resolverMuseo(datos);
        r.name = datos.name;
        r.description = datos.description;
        r.capacity = datos.capacity;
        return r;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response eliminar(@PathParam("id") Integer id) {
        if (Artifact.count("exhibitionRoom.id", id) > 0) {
            throw Errores.conflicto("No se puede eliminar: hay objetos expuestos actualmente en esta sala.");
        }
        if (ArtifactExhibition.count("exhibitionRoom.id", id) > 0) {
            throw Errores.conflicto("No se puede eliminar: la sala aparece en el historial de exposición de algún objeto.");
        }
        if (TourRoom.count("id.exhibitionRoomId", id) > 0) {
            throw Errores.conflicto("No se puede eliminar: la sala forma parte de una visita guiada.");
        }
        if (!ExhibitionRoom.deleteById(id)) throw Errores.noEncontrado("La sala no existe.");
        return Response.noContent().build();
    }

    private Museum resolverMuseo(ExhibitionRoom datos) {
        if (datos.museum == null || datos.museum.id == null) {
            throw Errores.peticionInvalida("Debes elegir el museo al que pertenece la sala.");
        }
        Museum m = Museum.findById(datos.museum.id);
        if (m == null) throw Errores.noEncontrado("El museo elegido no existe.");
        return m;
    }

    private void validar(ExhibitionRoom r) {
        if (r == null) throw Errores.peticionInvalida("Faltan los datos de la sala.");
        Errores.exigirTexto(r.name, "nombre");
        if (r.capacity == null || r.capacity <= 0) {
            throw Errores.peticionInvalida("La capacidad debe ser un número mayor que 0.");
        }
    }
}

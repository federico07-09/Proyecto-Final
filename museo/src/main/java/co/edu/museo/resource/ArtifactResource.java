package co.edu.museo.resource;

import co.edu.museo.model.Artifact;
import co.edu.museo.model.ArtifactExhibition;
import co.edu.museo.model.Artist;
import co.edu.museo.model.Category;
import co.edu.museo.model.ExhibitionRoom;
import co.edu.museo.util.Errores;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.util.List;

@Path("/api/artifacts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ArtifactResource {

    @GET
    public List<Artifact> listar() {
        return Artifact.list("order by name");
    }

    @GET
    @Path("/{id}")
    public Artifact obtener(@PathParam("id") Integer id) {
        Artifact a = Artifact.findById(id);
        if (a == null) throw Errores.noEncontrado("El objeto no existe.");
        return a;
    }

    /** Historial de exposición: salas en las que ha estado el objeto, de la más reciente a la más antigua. */
    @GET
    @Path("/{id}/history")
    public List<ArtifactExhibition> historial(@PathParam("id") Integer id) {
        return ArtifactExhibition.list("artifact.id = ?1 order by startDate desc, id desc", id);
    }

    @POST
    @Transactional
    public Response crear(Artifact datos) {
        validar(datos);
        resolverRelaciones(datos);
        datos.id = null;
        datos.persist();
        registrarHistorial(datos, datos.exhibitionRoom);
        return Response.status(Response.Status.CREATED).entity(datos).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Artifact actualizar(@PathParam("id") Integer id, Artifact datos) {
        validar(datos);
        resolverRelaciones(datos);
        Artifact a = Artifact.findById(id);
        if (a == null) throw Errores.noEncontrado("El objeto no existe.");
        a.name = datos.name;
        a.description = datos.description;
        a.imageUrl = datos.imageUrl;
        a.createdAt = datos.createdAt;
        a.acquiredAt = datos.acquiredAt;
        a.conditionPercentage = datos.conditionPercentage;
        a.category = datos.category;
        a.artist = datos.artist;
        a.exhibitionRoom = datos.exhibitionRoom;
        registrarHistorial(a, a.exhibitionRoom);
        return a;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response eliminar(@PathParam("id") Integer id) {
        ArtifactExhibition.delete("artifact.id", id);
        if (!Artifact.deleteById(id)) throw Errores.noEncontrado("El objeto no existe.");
        return Response.noContent().build();
    }

    /**
     * Mantiene el historial de exposición: si el objeto cambió de sala, cierra el periodo
     * abierto en la sala anterior y abre uno nuevo en la sala actual.
     */
    private void registrarHistorial(Artifact a, ExhibitionRoom nueva) {
        ArtifactExhibition abierto =
                ArtifactExhibition.find("artifact.id = ?1 and endDate is null", a.id).firstResult();

        if (abierto != null && nueva != null && abierto.exhibitionRoom.id.equals(nueva.id)) {
            return; // sigue en la misma sala
        }
        LocalDateTime ahora = LocalDateTime.now();
        if (abierto != null) {
            abierto.endDate = ahora;
        }
        if (nueva != null) {
            ArtifactExhibition h = new ArtifactExhibition();
            h.artifact = a;
            h.exhibitionRoom = nueva;
            h.startDate = ahora;
            h.persist();
        }
    }

    private void resolverRelaciones(Artifact a) {
        if (a.category == null || a.category.id == null) {
            throw Errores.peticionInvalida("Debes elegir una categoría para el objeto.");
        }
        Category c = Category.findById(a.category.id);
        if (c == null) throw Errores.noEncontrado("La categoría elegida no existe.");
        a.category = c;

        if (a.artist != null && a.artist.id != null) {
            Artist ar = Artist.findById(a.artist.id);
            if (ar == null) throw Errores.noEncontrado("El artista elegido no existe.");
            a.artist = ar;
        } else {
            a.artist = null; // el artista es opcional
        }

        if (a.exhibitionRoom != null && a.exhibitionRoom.id != null) {
            ExhibitionRoom r = ExhibitionRoom.findById(a.exhibitionRoom.id);
            if (r == null) throw Errores.noEncontrado("La sala elegida no existe.");
            a.exhibitionRoom = r;
        } else {
            a.exhibitionRoom = null;
        }
    }

    private void validar(Artifact a) {
        if (a == null) throw Errores.peticionInvalida("Faltan los datos del objeto.");
        Errores.exigirTexto(a.name, "nombre");
        if (a.conditionPercentage == null || a.conditionPercentage < 0 || a.conditionPercentage > 100) {
            throw Errores.peticionInvalida("El estado de conservación debe estar entre 0 y 100.");
        }
        if (a.createdAt != null && a.acquiredAt != null && a.acquiredAt.isBefore(a.createdAt)) {
            throw Errores.peticionInvalida("La fecha de adquisición no puede ser anterior a la de creación.");
        }
    }
}

package co.edu.museo.resource;

import co.edu.museo.model.Artifact;
import co.edu.museo.model.Artist;
import co.edu.museo.util.Errores;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/artists")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ArtistResource {

    @GET
    public List<Artist> listar() {
        return Artist.list("order by name");
    }

    @GET
    @Path("/{id}")
    public Artist obtener(@PathParam("id") Integer id) {
        Artist a = Artist.findById(id);
        if (a == null) throw Errores.noEncontrado("El artista no existe.");
        return a;
    }

    @POST
    @Transactional
    public Response crear(Artist datos) {
        validar(datos);
        datos.id = null;
        datos.persist();
        return Response.status(Response.Status.CREATED).entity(datos).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Artist actualizar(@PathParam("id") Integer id, Artist datos) {
        validar(datos);
        Artist a = Artist.findById(id);
        if (a == null) throw Errores.noEncontrado("El artista no existe.");
        a.name = datos.name;
        a.biography = datos.biography;
        a.nationality = datos.nationality;
        return a;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response eliminar(@PathParam("id") Integer id) {
        if (Artifact.count("artist.id", id) > 0) {
            throw Errores.conflicto("No se puede eliminar: el artista tiene objetos asociados.");
        }
        if (!Artist.deleteById(id)) throw Errores.noEncontrado("El artista no existe.");
        return Response.noContent().build();
    }

    private void validar(Artist a) {
        if (a == null) throw Errores.peticionInvalida("Faltan los datos del artista.");
        Errores.exigirTexto(a.name, "nombre");
    }
}

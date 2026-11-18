package co.edu.museo.resource;

import co.edu.museo.model.ExhibitionRoom;
import co.edu.museo.model.Museum;
import co.edu.museo.util.Errores;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/museums")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MuseumResource {

    @GET
    public List<Museum> listar() {
        return Museum.list("order by name");
    }

    @GET
    @Path("/{id}")
    public Museum obtener(@PathParam("id") Integer id) {
        Museum m = Museum.findById(id);
        if (m == null) throw Errores.noEncontrado("El museo no existe.");
        return m;
    }

    @POST
    @Transactional
    public Response crear(Museum datos) {
        validar(datos);
        datos.id = null;
        datos.persist();
        return Response.status(Response.Status.CREATED).entity(datos).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Museum actualizar(@PathParam("id") Integer id, Museum datos) {
        validar(datos);
        Museum m = Museum.findById(id);
        if (m == null) throw Errores.noEncontrado("El museo no existe.");
        m.name = datos.name;
        m.description = datos.description;
        m.latitude = datos.latitude;
        m.longitude = datos.longitude;
        m.landingPageUrl = datos.landingPageUrl;
        return m;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response eliminar(@PathParam("id") Integer id) {
        if (ExhibitionRoom.count("museum.id", id) > 0) {
            throw Errores.conflicto("No se puede eliminar: el museo tiene salas de exposición registradas.");
        }
        if (!Museum.deleteById(id)) throw Errores.noEncontrado("El museo no existe.");
        return Response.noContent().build();
    }

    private void validar(Museum m) {
        if (m == null) throw Errores.peticionInvalida("Faltan los datos del museo.");
        Errores.exigirTexto(m.name, "nombre");
        if (m.latitude != null && (m.latitude < -90 || m.latitude > 90)) {
            throw Errores.peticionInvalida("La latitud debe estar entre -90 y 90.");
        }
        if (m.longitude != null && (m.longitude < -180 || m.longitude > 180)) {
            throw Errores.peticionInvalida("La longitud debe estar entre -180 y 180.");
        }
    }
}

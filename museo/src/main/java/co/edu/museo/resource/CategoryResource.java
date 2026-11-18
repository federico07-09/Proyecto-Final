package co.edu.museo.resource;

import co.edu.museo.model.Artifact;
import co.edu.museo.model.Category;
import co.edu.museo.util.Errores;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoryResource {

    @GET
    public List<Category> listar() {
        return Category.list("order by name");
    }

    @GET
    @Path("/{id}")
    public Category obtener(@PathParam("id") Integer id) {
        Category c = Category.findById(id);
        if (c == null) throw Errores.noEncontrado("La categoría no existe.");
        return c;
    }

    @POST
    @Transactional
    public Response crear(Category datos) {
        validar(datos);
        datos.id = null;
        datos.persist();
        return Response.status(Response.Status.CREATED).entity(datos).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Category actualizar(@PathParam("id") Integer id, Category datos) {
        validar(datos);
        Category c = Category.findById(id);
        if (c == null) throw Errores.noEncontrado("La categoría no existe.");
        c.name = datos.name;
        c.description = datos.description;
        return c;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response eliminar(@PathParam("id") Integer id) {
        if (Artifact.count("category.id", id) > 0) {
            throw Errores.conflicto("No se puede eliminar: hay objetos clasificados en esta categoría.");
        }
        if (!Category.deleteById(id)) throw Errores.noEncontrado("La categoría no existe.");
        return Response.noContent().build();
    }

    private void validar(Category c) {
        if (c == null) throw Errores.peticionInvalida("Faltan los datos de la categoría.");
        Errores.exigirTexto(c.name, "nombre");
    }
}

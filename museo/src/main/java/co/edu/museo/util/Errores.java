package co.edu.museo.util;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

/** Lanza errores HTTP con cuerpo JSON {"error": "mensaje"} para que el front los muestre. */
public final class Errores {

    private Errores() {}

    public static WebApplicationException peticionInvalida(String mensaje) {
        return crear(400, mensaje);
    }

    public static WebApplicationException noEncontrado(String mensaje) {
        return crear(404, mensaje);
    }

    public static WebApplicationException conflicto(String mensaje) {
        return crear(409, mensaje);
    }

    private static WebApplicationException crear(int estado, String mensaje) {
        return new WebApplicationException(
                Response.status(estado)
                        .type(MediaType.APPLICATION_JSON)
                        .entity(Map.of("error", mensaje))
                        .build());
    }

    public static void exigirTexto(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            throw peticionInvalida("El campo \"" + campo + "\" es obligatorio.");
        }
    }
}

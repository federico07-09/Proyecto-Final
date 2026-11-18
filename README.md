
# Sistema de Administración de Museos

## Descripción general

El **Sistema de Administración de Museos** es una aplicación web desarrollada para gestionar de manera integral el patrimonio cultural de uno o varios museos, centralizando la información de sus obras (artefactos), artistas, categorías, salas de exposición, historial de exhibiciones y recorridos guiados.

El sistema permite registrar, consultar, actualizar y organizar tanto el inventario físico como la trazabilidad histórica de cada pieza dentro de las salas, además de planificar visitas guiadas con un orden secuencial específico. La aplicación cuenta con un backend REST desarrollado en **Java con Quarkus**, una interfaz web dinámica construida con **HTML5, CSS3 y JavaScript**, y persistencia en base de datos relacional (**MySQL / MariaDB**), garantizando consistencia e integridad referencial entre la interfaz y el almacenamiento.

---

## Objetivo del proyecto

El objetivo principal del proyecto es construir una solución de software bajo arquitectura cliente-servidor que permita centralizar y administrar el patrimonio cultural de los museos, facilitando el inventario de piezas, el seguimiento de su estado de conservación, el control histórico de sus exhibiciones y la organización estructurada de recorridos guiados.

---

## Funcionalidades principales

### Gestión de museos
Permite registrar y administrar la información general de cada museo, incluyendo:
- Nombre y descripción del museo.
- Ubicación geográfica mediante coordenadas (`latitude` y `longitude`).
- Enlace URL a su página web principal (`landing_page_url`).

### Gestión de obras (artefactos)
Permite administrar el inventario de piezas culturales del museo, incluyendo:
- Nombre, descripción e imagen de referencia (`image_url`).
- Fechas de creación (`created_at`) y de adquisición (`acquired_at`).
- Porcentaje de estado de conservación (`condition_percentage`).
- Asociación con una categoría, un artista (opcional, máximo uno por obra) y su sala de exposición actual.

### Gestión de categorías
Permite clasificar las obras mediante categorías con nombre y descripción, facilitando su organización, filtrado y búsqueda dentro del catálogo.

### Gestión de artistas
Mantiene el registro biográfico de los autores de las obras, almacenando:
- Nombre completo.
- Biografía.
- Nacionalidad.

### Gestión de salas de exposición
Organiza los espacios físicos dentro de cada museo registrado, permitiendo gestionar:
- Museo al que pertenece la sala.
- Nombre y descripción de la sala.
- Capacidad máxima de visitantes o piezas (`capacity`).

### Historial de exhibición de obras
Realiza el seguimiento y trazabilidad de las salas en las que ha sido expuesta cada obra a lo largo del tiempo, registrando las fechas de inicio y fin de cada periodo de exhibición (`ArtifactExhibition`).

### Gestión de recorridos guiados
Permite diseñar y administrar visitas guiadas (`Tour`) que incluyen:
- Nombre y descripción del recorrido.
- Fechas de inicio (`start_at`) y finalización (`end_at`).
- Enlace URL a la página informativa del recorrido (`landing_page_url`).
- Selección de múltiples salas de exposición siguiendo un orden de recorrido específico (`sequence_number`).

---

## Tecnologías utilizadas

| Tecnología | Uso |
| :--- | :--- |
| **Java** | Lenguaje principal de programación del backend |
| **Quarkus** | Framework backend para la construcción de la API REST y persistencia ORM |
| **MySQL / MariaDB** | Motor de base de datos relacional |
| **SQL** | Definición del esquema, llaves foráneas y manipulación de datos |
| **Maven** | Gestión del ciclo de vida del proyecto y dependencias (`pom.xml` / `mvnw`) |
| **HTML5** | Estructura semántica de las vistas web |
| **CSS3** | Estilos visuales y diseño responsivo de la interfaz (`estilos.css`) |
| **JavaScript (ES6+)** | Consumo asíncrono de la API REST (`fetch`) y dinamismo en el cliente |
| **GitHub** | Control de versiones y alojamiento del repositorio |

---

## Librerías y dependencias principales

El proyecto utiliza **Maven** (incluyendo el wrapper `./mvnw`) para administrar sus dependencias y complementos de compilación, configurados en el archivo `pom.xml`:

- **Quarkus REST / JAX-RS** (Exposición de endpoints y servicios web RESTful)
- **Quarkus Hibernate ORM / JPA** (Mapeo objeto-relacional de las entidades)
- **Quarkus JDBC MySQL** (Controlador de conexión con la base de datos)
- **Quarkus Jackson / JSON-B** (Serialización y deserialización automática de objetos JSON)
- **Maven Compiler Plugin**

---

## Motor de base de datos

El proyecto utiliza un motor relacional compatible con SQL (**MySQL / MariaDB**).

Nombre recomendado de la base de datos:
```text
museo_db
```

La base de datos está normalizada y contiene las siguientes entidades principales y tablas asociativas:
- `museum` (Museos)
- `exhibition_room` (Salas de exposición)
- `artist` (Artistas)
- `category` (Categorías)
- `artifact` (Obras o artefactos)
- `exhibited_in` / `artifact_exhibition` (Historial de exhibición de obras)
- `tour` (Recorridos guiados)
- `tour_room` (Detalle ordenado de salas por recorrido mediante `sequence_number`)

El script SQL de creación de tablas y relaciones se encuentra en la carpeta:
```text
museo/sql/
```

Script principal del proyecto:
- `museo_db.sql`

---

## Estructura del proyecto

```text
proyecto-final/
├── README.md
└── museo/
    ├── README.md
    ├── mvnw
    ├── mvnw.cmd
    ├── pom.xml
    ├── sql/
    │   └── museo_db.sql
    └── src/
        └── main/
            ├── java/
            │   └── co/
            │       └── edu/
            │           └── museo/
            │               ├── model/
            │               │   ├── Artifact.java
            │               │   ├── ArtifactExhibition.java
            │               │   ├── Artist.java
            │               │   ├── Category.java
            │               │   ├── ExhibitionRoom.java
            │               │   ├── Museum.java
            │               │   ├── Tour.java
            │               │   ├── TourRoom.java
            │               │   └── TourRoomId.java
            │               ├── resource/
            │               │   ├── ArtifactResource.java
            │               │   ├── ArtistResource.java
            │               │   ├── CategoryResource.java
            │               │   ├── MuseumResource.java
            │               │   ├── RoomResource.java
            │               │   └── TourResource.java
            │               └── util/
            │                   └── Errores.java
            └── resources/
                ├── application.properties
                └── META-INF/
                    └── resources/
                        ├── index.html
                        ├── museos.html
                        ├── salas.html
                        ├── artistas.html
                        ├── categorias.html
                        ├── objetos.html
                        ├── visitas.html
                        ├── css/
                        │   └── estilos.css
                        └── js/
                            ├── comun.js
                            ├── inicio.js
                            ├── objetos.js
                            ├── visitas.js
                            └── vistas.js
```

---

## Ejecución del proyecto

1. **Configurar la base de datos:** Ejecutar el script `museo/sql/museo_db.sql` en el gestor de base de datos (MySQL Workbench o phpMyAdmin) y verificar las credenciales de conexión en `museo/src/main/resources/application.properties`.
2. **Iniciar el servidor en modo desarrollo:** Desde la carpeta `museo/`, ejecutar:
   ```bash
   ./mvnw quarkus:dev
   ```
3. **Acceder a la aplicación web:** Abrir el navegador e ingresar a:
   ```text
   http://localhost:8080/index.html
   ```

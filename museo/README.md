# Sistema de Gestión de Museos

Proyecto integrador: Programación Orientada a Objetos (Java + Quarkus + JPA), Diseño Web (HTML, CSS, JavaScript) y Bases de Datos (MySQL en XAMPP).

## Cómo ejecutarlo
1. Abre XAMPP y enciende **MySQL** (y Apache si quieres usar phpMyAdmin).
2. En phpMyAdmin ejecuta `sql/museo_db.sql` (crea la base `museo_db`). Si ya tienes tu base, solo asegúrate de que exista la tabla `artifact_exhibition` (historial de exposición).
3. En una terminal dentro de esta carpeta: `mvn quarkus:dev` (o `.\mvnw quarkus:dev` si tienes el wrapper).
4. Abre http://localhost:8080

## Estructura
- `src/main/java/co/edu/museo/model`: entidades JPA (Museum, ExhibitionRoom, Category, Artist, Artifact, ArtifactExhibition, Tour, TourRoom, TourRoomId).
- `src/main/java/co/edu/museo/resource`: servicios REST (`/api/museums`, `/api/rooms`, `/api/categories`, `/api/artists`, `/api/artifacts`, `/api/tours`).
- `src/main/resources/META-INF/resources`: páginas web (HTML, `css/`, `js/`).
- `src/main/resources/application.properties`: conexión a MySQL (usuario `root`, sin contraseña, base `museo_db`).

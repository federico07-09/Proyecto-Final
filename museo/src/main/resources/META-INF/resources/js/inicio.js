"use strict";
/* Portada: resumen del inventario, objetos que necesitan atención y próximas visitas. */

const cont = $("#contenido");
cont.innerHTML = `<p class="conteo" aria-live="polite">Cargando el resumen del museo…</p>`;

(async function () {
  let objetos, artistas, museos, salas, visitas;
  try {
    [objetos, artistas, museos, salas, visitas] = await Promise.all([
      api("/artifacts"), api("/artists"), api("/museums"), api("/rooms"), api("/tours"),
    ]);
  } catch (e) {
    cont.innerHTML = `<p class="error" role="alert">${esc(e.message)}</p>`;
    return;
  }

  const frase = `El inventario reúne ${plural(objetos.length, "objeto", "objetos")} de ${plural(artistas.length, "artista", "artistas")}, expuestos en ${plural(salas.length, "sala", "salas")} de ${plural(museos.length, "museo", "museos")}.`;

  const atencion = objetos
    .filter((o) => o.conditionPercentage < 50)
    .sort((a, b) => a.conditionPercentage - b.conditionPercentage)
    .slice(0, 5);

  const ahora = new Date();
  const proximas = visitas
    .filter((v) => v.startAt && new Date(v.startAt) >= ahora)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    .slice(0, 4);

  cont.innerHTML = `
    <header class="cabecera-pagina">
      <h1>Sistema de Gestión de Museos</h1>
    </header>
    <p class="portada-frase">${esc(frase)}</p>
    <div class="accesos">
      <a class="boton primario" href="objetos.html" style="text-decoration:none;display:inline-flex;align-items:center">Ver el inventario</a>
      <a class="boton" href="visitas.html" style="text-decoration:none;display:inline-flex;align-items:center">Visitas guiadas</a>
      <a class="boton" href="salas.html" style="text-decoration:none;display:inline-flex;align-items:center">Salas de exposición</a>
    </div>

    <div class="portada-bloques">
      <section aria-labelledby="t-atencion">
        <h2 id="t-atencion">Objetos que necesitan atención</h2>
        ${atencion.length
          ? `<ul class="lista-simple">${atencion.map((o) => `
              <li><span>${esc(o.name)}<span class="secundario"> — ${o.exhibitionRoom ? esc(o.exhibitionRoom.name) : "en depósito"}</span></span>
              <strong>${o.conditionPercentage} %</strong></li>`).join("")}</ul>`
          : `<p>Todos los objetos tienen un estado de conservación de 50 % o más.</p>`}
      </section>

      <section aria-labelledby="t-visitas">
        <h2 id="t-visitas">Próximas visitas guiadas</h2>
        ${proximas.length
          ? `<ul class="lista-simple">${proximas.map((v) => `
              <li><span>${esc(v.name)}<span class="secundario"> — ${plural((v.rooms || []).length, "sala", "salas")}</span></span>
              <span>${fechaHora(v.startAt)}</span></li>`).join("")}</ul>`
          : `<p>No hay visitas programadas a partir de hoy.</p>`}
      </section>
    </div>`;
})();

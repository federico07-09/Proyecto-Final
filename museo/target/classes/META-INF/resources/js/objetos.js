"use strict";
/* Inventario de objetos: placas tipo museo, filtros, formulario e historial de exposición. */

let objetos = [];
const cont = $("#contenido");

cont.innerHTML = `
  <header class="cabecera-pagina">
    <h1>Objetos</h1>
    <p>El inventario de piezas del museo, con su estado de conservación y la sala donde se exhiben hoy.</p>
  </header>
  <div class="barra">
    <label class="solo-lectores" for="buscar">Buscar objetos</label>
    <input id="buscar" class="buscar" type="search" placeholder="Buscar por nombre, artista o descripción…">
    <label class="solo-lectores" for="filtro-categoria">Filtrar por categoría</label>
    <select id="filtro-categoria" class="filtro"></select>
    <label class="solo-lectores" for="filtro-sala">Filtrar por sala</label>
    <select id="filtro-sala" class="filtro"></select>
    <span class="conteo" id="conteo" aria-live="polite"></span>
    <span class="espacio"></span>
    <button class="boton primario" id="nuevo" type="button">Nuevo objeto</button>
  </div>
  <div id="galeria" class="galeria"></div>`;

const galeria = $("#galeria");

/* ---------- Formulario ---------- */
const formulario = crearFormulario({
  id: "objeto",
  singular: "objeto",
  nuevo: "Nuevo",
  campos: [
    { clave: "name", etiqueta: "Nombre", tipo: "texto", requerido: true },
    { clave: "description", etiqueta: "Descripción", tipo: "area" },
    { clave: "imageUrl", etiqueta: "Imagen", tipo: "url", ayuda: "Enlace a una imagen en internet (http:// o https://)." },
    { clave: "createdAt", etiqueta: "Fecha de creación", tipo: "fecha", ancho: "mitad" },
    { clave: "acquiredAt", etiqueta: "Fecha de adquisición", tipo: "fecha", ancho: "mitad" },
    { clave: "conditionPercentage", etiqueta: "Estado de conservación (%)", tipo: "numero", min: 0, max: 100, requerido: true, ancho: "mitad", ayuda: "De 0 (muy deteriorado) a 100 (perfecto)." },
    { clave: "category", etiqueta: "Categoría", tipo: "select", requerido: true, origen: "/categories", opcion: (c) => c.name, vacio: "Elige una categoría…", ancho: "mitad" },
    { clave: "artist", etiqueta: "Artista", tipo: "select", origen: "/artists", opcion: (a) => a.name, vacio: "Sin artista", ancho: "mitad", ayuda: "Un objeto tiene como máximo un artista." },
    { clave: "exhibitionRoom", etiqueta: "Sala actual", tipo: "select", origen: "/rooms", opcion: (s) => `${s.museum.name}: ${s.name}`, vacio: "Sin sala (en depósito)", ancho: "mitad", ayuda: "Si cambias la sala, el cambio queda en el historial." },
  ],
  alGuardar: async (cuerpo, item) => {
    if (item) await api(`/artifacts/${item.id}`, { metodo: "PUT", cuerpo });
    else await api("/artifacts", { metodo: "POST", cuerpo });
    aviso("Guardado.");
    await cargar();
  },
});

/* ---------- Historial ---------- */
const dlgHistorial = document.createElement("dialog");
dlgHistorial.className = "dialogo";
dlgHistorial.setAttribute("aria-labelledby", "historial-titulo");
dlgHistorial.innerHTML = `
  <div class="dialogo-cuerpo">
    <h2 id="historial-titulo"></h2>
    <div id="historial-cuerpo"></div>
    <div class="acciones"><button type="button" class="boton" data-cerrar>Cerrar</button></div>
  </div>`;
document.body.appendChild(dlgHistorial);
$("[data-cerrar]", dlgHistorial).addEventListener("click", () => dlgHistorial.close());

async function verHistorial(objeto) {
  try {
    const historial = await api(`/artifacts/${objeto.id}/history`);
    $("#historial-titulo").textContent = `Historial de exposición: ${objeto.name}`;
    $("#historial-cuerpo").innerHTML = historial.length
      ? `<ul class="historial">${historial.map((h) => `
          <li class="${h.endDate ? "" : "actual"}">
            <strong>${esc(h.exhibitionRoom.name)}</strong> (${esc(h.exhibitionRoom.museum.name)})<br>
            Desde ${fecha(h.startDate)} ${h.endDate ? "hasta " + fecha(h.endDate) : "· expuesto actualmente"}
          </li>`).join("")}</ul>`
      : `<p>Este objeto aún no tiene historial de exposición.</p>`;
    dlgHistorial.showModal();
  } catch (e) {
    aviso(e.message, true);
  }
}

/* ---------- Pintado ---------- */
function nivelConservacion(p) {
  if (p >= 70) return { clase: "", texto: "Bueno" };
  if (p >= 40) return { clase: "medio", texto: "Regular" };
  return { clase: "bajo", texto: "Crítico" };
}

function placa(o) {
  const nivel = nivelConservacion(o.conditionPercentage);
  const imagen = urlSegura(o.imageUrl);
  const anio = o.createdAt ? new Date(o.createdAt).getFullYear() : null;
  return `
    <article class="obra">
      <figure class="obra-marco">
        ${imagen
          ? `<img src="${esc(imagen)}" alt="${esc(o.name)}" loading="lazy">`
          : `<div class="obra-vacio" aria-hidden="true">${esc(o.name.charAt(0).toUpperCase())}</div>`}
      </figure>
      <div class="placa">
        <h3>${esc(o.name)}</h3>
        <p class="autor">${o.artist ? esc(o.artist.name) + (o.artist.nationality ? `, ${esc(o.artist.nationality)}` : "") : "Autor desconocido"}</p>
        <p class="meta">${esc(o.category.name)}${anio ? `, ${anio}` : ""}</p>
        ${o.description ? `<p class="detalle">${esc(recortar(o.description, 110))}</p>` : ""}
        <dl>
          <dt>Sala</dt><dd>${o.exhibitionRoom ? esc(o.exhibitionRoom.name) + " (" + esc(o.exhibitionRoom.museum.name) + ")" : "En depósito"}</dd>
          <dt>Adquirido</dt><dd>${fecha(o.acquiredAt)}</dd>
        </dl>
        <div class="conservacion ${nivel.clase}">
          <div class="texto"><span>Conservación: ${nivel.texto}</span><span>${o.conditionPercentage} %</span></div>
          <div class="pista" role="meter" aria-label="Estado de conservación" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${o.conditionPercentage}">
            <span class="nivel" style="width:${o.conditionPercentage}%"></span>
          </div>
        </div>
        <div class="placa-acciones">
          <button class="boton chico" type="button" data-historial="${o.id}">Historial</button>
          <button class="boton chico" type="button" data-editar="${o.id}">Editar</button>
          <button class="boton chico peligro" type="button" data-eliminar="${o.id}">Eliminar</button>
        </div>
      </div>
    </article>`;
}

function pintar() {
  const texto = $("#buscar").value.trim().toLowerCase();
  const categoria = $("#filtro-categoria").value;
  const sala = $("#filtro-sala").value;

  const visibles = objetos.filter((o) => {
    if (categoria && String(o.category.id) !== categoria) return false;
    if (sala === "ninguna" && o.exhibitionRoom) return false;
    if (sala && sala !== "ninguna" && (!o.exhibitionRoom || String(o.exhibitionRoom.id) !== sala)) return false;
    if (!texto) return true;
    return [o.name, o.description, o.artist && o.artist.name, o.category.name]
      .some((v) => v && v.toLowerCase().includes(texto));
  });

  $("#conteo").textContent = objetos.length ? `${visibles.length} de ${objetos.length}` : "";

  if (!objetos.length) {
    galeria.className = "";
    galeria.innerHTML = `<div class="vacio"><p>Aún no hay objetos registrados.</p>
      <button class="boton primario" type="button" data-nuevo>Nuevo objeto</button></div>`;
    return;
  }
  if (!visibles.length) {
    galeria.className = "";
    galeria.innerHTML = `<div class="vacio"><p>Ningún objeto coincide con los filtros.</p></div>`;
    return;
  }
  galeria.className = "galeria";
  galeria.innerHTML = visibles.map(placa).join("");
  galeria.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      const vacio = document.createElement("div");
      vacio.className = "obra-vacio";
      vacio.setAttribute("aria-hidden", "true");
      vacio.textContent = img.alt.charAt(0).toUpperCase();
      img.replaceWith(vacio);
    });
  });
}

async function cargarFiltros() {
  const [categorias, salas] = await Promise.all([api("/categories"), api("/rooms")]);
  $("#filtro-categoria").innerHTML = `<option value="">Todas las categorías</option>` +
    categorias.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
  $("#filtro-sala").innerHTML = `<option value="">Todas las salas</option><option value="ninguna">Sin sala (en depósito)</option>` +
    salas.map((s) => `<option value="${s.id}">${esc(s.museum.name)}: ${esc(s.name)}</option>`).join("");
}

async function cargar() {
  try {
    objetos = await api("/artifacts");
    await cargarFiltros();
  } catch (e) {
    galeria.className = "";
    galeria.innerHTML = `<p class="error" role="alert">${esc(e.message)}</p>`;
    return;
  }
  pintar();
}

/* ---------- Eventos ---------- */
$("#nuevo").addEventListener("click", () => formulario.abrir());
["#buscar", "#filtro-categoria", "#filtro-sala"].forEach((s) => $(s).addEventListener("input", pintar));

galeria.addEventListener("click", async (e) => {
  const boton = e.target.closest("button");
  if (!boton) return;
  if (boton.hasAttribute("data-nuevo")) return formulario.abrir();
  const buscar = (id) => objetos.find((o) => String(o.id) === id);

  if (boton.dataset.editar) return formulario.abrir(buscar(boton.dataset.editar));
  if (boton.dataset.historial) return verHistorial(buscar(boton.dataset.historial));
  if (boton.dataset.eliminar) {
    const o = buscar(boton.dataset.eliminar);
    if (!confirm(`¿Eliminar "${o.name}" y todo su historial de exposición? Esta acción no se puede deshacer.`)) return;
    try {
      await api(`/artifacts/${o.id}`, { metodo: "DELETE" });
      aviso("Eliminado.");
      await cargar();
    } catch (err) {
      aviso(err.message, true);
    }
  }
});

cargar();

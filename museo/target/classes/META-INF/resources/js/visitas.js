"use strict";
/* Visitas guiadas: cada visita recorre varias salas en un orden definido. */

let visitas = [];
const cont = $("#contenido");

cont.innerHTML = `
  <header class="cabecera-pagina">
    <h1>Visitas guiadas</h1>
    <p>Recorridos con fechas, un enlace informativo y las salas que visitan, en orden.</p>
  </header>
  <div class="barra">
    <label class="solo-lectores" for="buscar">Buscar visitas</label>
    <input id="buscar" class="buscar" type="search" placeholder="Buscar visitas guiadas…">
    <span class="conteo" id="conteo" aria-live="polite"></span>
    <span class="espacio"></span>
    <button class="boton primario" id="nuevo" type="button">Nueva visita</button>
  </div>
  <div id="lista"></div>`;

const lista = $("#lista");

/* ---------- Editor del orden del recorrido ---------- */
function crearEditorRuta() {
  const elemento = document.createElement("div");
  elemento.className = "campo completo editor-ruta";
  elemento.innerHTML = `
    <span class="etiqueta">Salas del recorrido, en orden</span>
    <div class="agregar">
      <select aria-label="Sala que quieres agregar"></select>
      <button type="button" class="boton" data-agregar>Agregar sala</button>
    </div>
    <ol></ol>
    <span class="ayuda">Agrega las salas en el orden en que se visitarán. Usa Subir y Bajar para reordenarlas.</span>`;

  const select = $("select", elemento);
  const ol = $("ol", elemento);
  let salas = [];
  let ids = [];

  const nombre = (id) => {
    const s = salas.find((x) => x.id === id);
    return s ? `${s.museum.name}: ${s.name}` : `Sala ${id}`;
  };

  function pintar() {
    ol.innerHTML = ids.map((id, i) => `
      <li>
        <span>${esc(nombre(id))}</span>
        <button type="button" class="boton chico" data-subir="${i}" ${i === 0 ? "disabled" : ""}>Subir</button>
        <button type="button" class="boton chico" data-bajar="${i}" ${i === ids.length - 1 ? "disabled" : ""}>Bajar</button>
        <button type="button" class="boton chico peligro" data-quitar="${i}">Quitar</button>
      </li>`).join("");
    select.innerHTML = `<option value="">Elige una sala…</option>` +
      salas.filter((s) => !ids.includes(s.id))
        .map((s) => `<option value="${s.id}">${esc(s.museum.name)}: ${esc(s.name)}</option>`).join("");
  }

  elemento.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-agregar")) {
      if (select.value) { ids.push(Number(select.value)); pintar(); }
      return;
    }
    const i = Number(b.dataset.subir ?? b.dataset.bajar ?? b.dataset.quitar);
    if (b.dataset.subir !== undefined && i > 0) [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]];
    if (b.dataset.bajar !== undefined && i < ids.length - 1) [ids[i + 1], ids[i]] = [ids[i], ids[i + 1]];
    if (b.dataset.quitar !== undefined) ids.splice(i, 1);
    pintar();
  });

  return {
    elemento,
    async cargar(item) {
      salas = await api("/rooms");
      ids = item && item.rooms ? item.rooms.map((r) => r.exhibitionRoom.id) : [];
      pintar();
    },
    obtener: () => ({ rooms: [...ids] }),
    validar: () => (ids.length ? null : "Agrega al menos una sala al recorrido."),
  };
}

/* ---------- Formulario ---------- */
const formulario = crearFormulario({
  id: "visita",
  singular: "visita guiada",
  nuevo: "Nueva",
  campos: [
    { clave: "name", etiqueta: "Nombre", tipo: "texto", requerido: true },
    { clave: "description", etiqueta: "Descripción", tipo: "area" },
    { clave: "startAt", etiqueta: "Inicio", tipo: "fechahora", ancho: "mitad" },
    { clave: "endAt", etiqueta: "Fin", tipo: "fechahora", ancho: "mitad" },
    { clave: "landingPageUrl", etiqueta: "Página web", tipo: "url", ayuda: "Debe empezar por http:// o https://" },
  ],
  extra: crearEditorRuta(),
  alGuardar: async (cuerpo, item) => {
    if (item) await api(`/tours/${item.id}`, { metodo: "PUT", cuerpo });
    else await api("/tours", { metodo: "POST", cuerpo });
    aviso("Guardado.");
    await cargar();
  },
});

/* ---------- Pintado ---------- */
function tarjeta(v) {
  const salas = (v.rooms || []);
  const fechas = v.startAt || v.endAt
    ? `${fechaHora(v.startAt)} a ${fechaHora(v.endAt)}`
    : "Sin fechas definidas";
  return `
    <article class="recorrido">
      <h3>${esc(v.name)}</h3>
      <p class="fechas">${fechas}</p>
      ${v.description ? `<p>${esc(recortar(v.description, 160))}</p>` : ""}
      ${salas.length
        ? `<ol class="ruta">${salas.map((r) => `
            <li>${esc(r.exhibitionRoom.name)}<span class="museo-ruta">${esc(r.exhibitionRoom.museum.name)}</span></li>`).join("")}</ol>`
        : `<p class="conteo">Esta visita aún no tiene salas.</p>`}
      ${urlSegura(v.landingPageUrl) ? `<p>${enlace(v.landingPageUrl, "Más información")}</p>` : ""}
      <div class="placa-acciones">
        <button class="boton chico" type="button" data-editar="${v.id}">Editar</button>
        <button class="boton chico peligro" type="button" data-eliminar="${v.id}">Eliminar</button>
      </div>
    </article>`;
}

function pintar() {
  const filtro = $("#buscar").value.trim().toLowerCase();
  const visibles = visitas.filter((v) => JSON.stringify(v).toLowerCase().includes(filtro));
  $("#conteo").textContent = visitas.length ? `${visibles.length} de ${visitas.length}` : "";

  if (!visitas.length) {
    lista.className = "";
    lista.innerHTML = `<div class="vacio"><p>Aún no hay visitas guiadas registradas.</p>
      <button class="boton primario" type="button" data-nuevo>Nueva visita</button></div>`;
    return;
  }
  if (!visibles.length) {
    lista.className = "";
    lista.innerHTML = `<div class="vacio"><p>Ninguna visita coincide con tu búsqueda.</p></div>`;
    return;
  }
  lista.className = "recorridos";
  lista.innerHTML = visibles.map(tarjeta).join("");
}

async function cargar() {
  try {
    visitas = await api("/tours");
  } catch (e) {
    lista.className = "";
    lista.innerHTML = `<p class="error" role="alert">${esc(e.message)}</p>`;
    return;
  }
  pintar();
}

$("#nuevo").addEventListener("click", () => formulario.abrir());
$("#buscar").addEventListener("input", pintar);

lista.addEventListener("click", async (e) => {
  const boton = e.target.closest("button");
  if (!boton) return;
  if (boton.hasAttribute("data-nuevo")) return formulario.abrir();
  const buscar = (id) => visitas.find((v) => String(v.id) === id);
  if (boton.dataset.editar) return formulario.abrir(buscar(boton.dataset.editar));
  if (boton.dataset.eliminar) {
    const v = buscar(boton.dataset.eliminar);
    if (!confirm(`¿Eliminar la visita "${v.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api(`/tours/${v.id}`, { metodo: "DELETE" });
      aviso("Eliminado.");
      await cargar();
    } catch (err) {
      aviso(err.message, true);
    }
  }
});

cargar();

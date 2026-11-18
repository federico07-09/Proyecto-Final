"use strict";
/* ==========================================================
   Utilidades compartidas: API, navegación, avisos, formularios
   y una tabla CRUD genérica.
   ========================================================== */

const API = "/api";
const $ = (selector, raiz = document) => raiz.querySelector(selector);

/* ---------- Texto y formato ---------- */
function esc(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function recortar(texto, max = 140) {
  if (!texto) return "";
  return texto.length > max ? texto.slice(0, max).trimEnd() + "…" : texto;
}

function plural(n, uno, varios) {
  return `${n} ${n === 1 ? uno : varios}`;
}

function urlSegura(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim()) ? url.trim() : "";
}

function enlace(url, texto) {
  const segura = urlSegura(url);
  if (!segura) return "—";
  return `<a href="${esc(segura)}" target="_blank" rel="noopener">${esc(texto || segura.replace(/^https?:\/\//i, ""))}</a>`;
}

function fecha(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

function fechaHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

/* ---------- Llamadas a la API ---------- */
async function api(ruta, { metodo = "GET", cuerpo } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(API + ruta, {
      method: metodo,
      headers: cuerpo ? { "Content-Type": "application/json" } : undefined,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
  } catch (e) {
    throw new Error("No se pudo conectar con el servidor. Revisa que la aplicación esté en ejecución y que MySQL esté encendido en XAMPP.");
  }
  if (respuesta.status === 204) return null;
  const texto = await respuesta.text();
  let datos = null;
  try { datos = texto ? JSON.parse(texto) : null; } catch (e) { /* respuesta que no es JSON */ }
  if (!respuesta.ok) {
    throw new Error((datos && datos.error) || `El servidor respondió con error ${respuesta.status}. Revisa la consola donde corre Quarkus.`);
  }
  return datos;
}

/* ---------- Avisos ---------- */
function aviso(texto, esError = false) {
  let caja = $("#avisos");
  if (!caja) {
    caja = document.createElement("div");
    caja.id = "avisos";
    caja.className = "avisos";
    caja.setAttribute("role", "status");
    document.body.appendChild(caja);
  }
  const el = document.createElement("div");
  el.className = "aviso" + (esError ? " error-aviso" : "");
  el.textContent = texto;
  caja.appendChild(el);
  setTimeout(() => el.remove(), esError ? 7000 : 3500);
}

/* ---------- Navegación lateral ---------- */
const PAGINAS = [
  ["index.html", "Inicio"],
  ["objetos.html", "Objetos"],
  ["artistas.html", "Artistas"],
  ["categorias.html", "Categorías"],
  ["museos.html", "Museos"],
  ["salas.html", "Salas de exposición"],
  ["visitas.html", "Visitas guiadas"],
];

function pintarLateral() {
  const lateral = $("#lateral");
  if (!lateral) return;
  const actual = location.pathname.split("/").pop() || "index.html";
  lateral.innerHTML = `
    <a class="marca" href="index.html">Gestión de Museos<small>Organiza, conserva y comparte el patrimonio</small></a>
    <nav aria-label="Principal">
      ${PAGINAS.map(([href, texto]) =>
        `<a href="${href}"${href === actual ? ' aria-current="page"' : ""}>${texto}</a>`).join("")}
    </nav>`;
}
pintarLateral();

/* ---------- Formulario en diálogo (reutilizable) ----------
   campos: [{ clave, etiqueta, tipo, requerido, ancho, ayuda, min, max, step,
              origen, opcion, vacio }]
   tipos: texto | area | url | numero | fecha | fechahora | select
   extra: { elemento, cargar(item), obtener(), validar() }  (bloque personalizado)
*/
function crearFormulario({ id, singular, nuevo = "Nuevo", campos, extra, alGuardar }) {
  const dlg = document.createElement("dialog");
  dlg.className = "dialogo";
  dlg.setAttribute("aria-labelledby", `titulo-${id}`);
  dlg.innerHTML = `
    <form class="formulario">
      <h2 id="titulo-${id}"></h2>
      <div class="campos"></div>
      <p class="error" role="alert" hidden></p>
      <div class="acciones">
        <button type="button" class="boton" data-cerrar>Cancelar</button>
        <button type="submit" class="boton primario">Guardar</button>
      </div>
    </form>`;
  document.body.appendChild(dlg);

  const form = $("form", dlg);
  const contenedor = $(".campos", dlg);
  const errorEl = $(".error", dlg);
  const titulo = $("h2", dlg);
  const controles = {};
  let editando = null;

  campos.forEach((c) => {
    const etiqueta = document.createElement("label");
    etiqueta.className = "campo" + (c.ancho === "mitad" ? "" : " completo");
    let control;
    if (c.tipo === "area") {
      control = document.createElement("textarea");
    } else if (c.tipo === "select") {
      control = document.createElement("select");
    } else {
      control = document.createElement("input");
      control.type = { texto: "text", url: "url", numero: "number", fecha: "date", fechahora: "datetime-local" }[c.tipo] || "text";
      if (c.tipo === "numero") {
        control.step = c.step || "1";
        if (c.min !== undefined) control.min = c.min;
        if (c.max !== undefined) control.max = c.max;
      }
    }
    control.id = `${id}-${c.clave}`;
    control.required = !!c.requerido;
    controles[c.clave] = control;

    const texto = document.createElement("span");
    texto.className = "etiqueta";
    texto.textContent = c.etiqueta + (c.requerido ? "" : " (opcional)");
    etiqueta.append(texto, control);
    if (c.ayuda) {
      const ayuda = document.createElement("span");
      ayuda.className = "ayuda";
      ayuda.textContent = c.ayuda;
      etiqueta.appendChild(ayuda);
    }
    contenedor.appendChild(etiqueta);
  });
  if (extra) contenedor.appendChild(extra.elemento);

  async function cargarOpciones(c, control, seleccionado) {
    const lista = await api(c.origen);
    control.innerHTML =
      `<option value="">${esc(c.vacio || "Elige una opción…")}</option>` +
      lista.map((x) => `<option value="${x.id}">${esc(c.opcion(x))}</option>`).join("");
    control.value = seleccionado ? String(seleccionado) : "";
  }

  function valorInicial(c, item) {
    if (!item || item[c.clave] === null || item[c.clave] === undefined) return "";
    const v = item[c.clave];
    if (c.tipo === "fecha") return String(v).slice(0, 10);
    if (c.tipo === "fechahora") return String(v).slice(0, 16);
    return v;
  }

  function leer(c, control) {
    const v = control.value;
    switch (c.tipo) {
      case "numero": return v === "" ? null : Number(v);
      case "fecha": return v ? v + "T00:00:00" : null;
      case "fechahora": return v ? (v.length === 16 ? v + ":00" : v) : null;
      case "select": return v ? { id: Number(v) } : null;
      default: return v.trim() === "" ? null : v.trim();
    }
  }

  function mostrarError(mensaje) {
    errorEl.textContent = mensaje;
    errorEl.hidden = false;
  }

  async function abrir(item = null) {
    editando = item;
    titulo.textContent = item ? `Editar ${singular}` : `${nuevo} ${singular}`;
    errorEl.hidden = true;
    form.reset();
    try {
      for (const c of campos) {
        if (c.tipo === "select") {
          await cargarOpciones(c, controles[c.clave], item && item[c.clave] ? item[c.clave].id : "");
        } else {
          controles[c.clave].value = valorInicial(c, item);
        }
      }
      if (extra) await extra.cargar(item);
    } catch (e) {
      aviso(e.message, true);
      return;
    }
    dlg.showModal();
    const primero = controles[campos[0].clave];
    if (primero) primero.focus();
  }

  $("[data-cerrar]", dlg).addEventListener("click", () => dlg.close());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    if (extra && extra.validar) {
      const problema = extra.validar();
      if (problema) return mostrarError(problema);
    }
    const datos = {};
    campos.forEach((c) => { datos[c.clave] = leer(c, controles[c.clave]); });
    if (extra) Object.assign(datos, extra.obtener());

    const boton = $("button[type=submit]", form);
    boton.disabled = true;
    try {
      await alGuardar(datos, editando);
      dlg.close();
    } catch (err) {
      mostrarError(err.message);
    } finally {
      boton.disabled = false;
    }
  });

  return { abrir };
}

/* ---------- Página CRUD genérica (tabla + formulario) ---------- */
function montarCrud(cfg) {
  const cont = $("#contenido");
  cont.innerHTML = `
    <header class="cabecera-pagina">
      <h1>${esc(cfg.titulo)}</h1>
      <p>${esc(cfg.intro)}</p>
    </header>
    <div class="barra">
      <label class="solo-lectores" for="buscar">Buscar ${esc(cfg.plural)}</label>
      <input id="buscar" class="buscar" type="search" placeholder="Buscar ${esc(cfg.plural)}…">
      <span class="conteo" id="conteo" aria-live="polite"></span>
      <span class="espacio"></span>
      <button class="boton primario" id="nuevo" type="button">${esc(cfg.nuevo)} ${esc(cfg.singular)}</button>
    </div>
    <div id="lista"></div>`;

  let datos = [];
  const lista = $("#lista");

  const formulario = crearFormulario({
    id: cfg.ruta.replace(/\W/g, ""),
    singular: cfg.singular,
    nuevo: cfg.nuevo,
    campos: cfg.campos,
    alGuardar: async (cuerpo, item) => {
      if (item) await api(`${cfg.ruta}/${item.id}`, { metodo: "PUT", cuerpo });
      else await api(cfg.ruta, { metodo: "POST", cuerpo });
      aviso("Guardado.");
      await cargar();
    },
  });

  async function cargar() {
    try {
      datos = await api(cfg.ruta);
    } catch (e) {
      lista.innerHTML = `<p class="error" role="alert">${esc(e.message)}</p>`;
      return;
    }
    pintar();
  }

  function pintar() {
    const filtro = $("#buscar").value.trim().toLowerCase();
    const visibles = datos.filter((d) => JSON.stringify(d).toLowerCase().includes(filtro));
    $("#conteo").textContent = datos.length ? `${visibles.length} de ${datos.length}` : "";

    if (!datos.length) {
      lista.innerHTML = `<div class="vacio">
        <p>Aún no hay ${esc(cfg.plural)} registrados.</p>
        <button class="boton primario" type="button" data-nuevo>${esc(cfg.nuevo)} ${esc(cfg.singular)}</button></div>`;
      return;
    }
    if (!visibles.length) {
      lista.innerHTML = `<div class="vacio"><p>Ningún resultado coincide con tu búsqueda.</p></div>`;
      return;
    }
    lista.innerHTML = `
      <div class="tabla-envoltura"><table>
        <thead><tr>
          ${cfg.columnas.map((c) => `<th scope="col">${esc(c.titulo)}</th>`).join("")}
          <th scope="col"><span class="solo-lectores">Acciones</span></th>
        </tr></thead>
        <tbody>
          ${visibles.map((d) => `<tr>
            ${cfg.columnas.map((c) => `<td>${c.valor(d)}</td>`).join("")}
            <td class="acciones">
              <button class="boton chico" type="button" data-editar="${d.id}">Editar</button>
              <button class="boton chico peligro" type="button" data-eliminar="${d.id}">Eliminar</button>
            </td></tr>`).join("")}
        </tbody>
      </table></div>`;
  }

  $("#nuevo").addEventListener("click", () => formulario.abrir());
  $("#buscar").addEventListener("input", pintar);

  lista.addEventListener("click", async (e) => {
    const boton = e.target.closest("button");
    if (!boton) return;
    if (boton.hasAttribute("data-nuevo")) return formulario.abrir();
    if (boton.dataset.editar) {
      return formulario.abrir(datos.find((d) => String(d.id) === boton.dataset.editar));
    }
    if (boton.dataset.eliminar) {
      const item = datos.find((d) => String(d.id) === boton.dataset.eliminar);
      if (!confirm(`¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`)) return;
      try {
        await api(`${cfg.ruta}/${item.id}`, { metodo: "DELETE" });
        aviso("Eliminado.");
        await cargar();
      } catch (err) {
        aviso(err.message, true);
      }
    }
  });

  cargar();
}

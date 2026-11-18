"use strict";
/* Configuración de las páginas de tabla: museos, salas, categorías y artistas. */

const VISTAS = {
  museos: {
    ruta: "/museums",
    titulo: "Museos",
    intro: "Los museos que administras, con su ubicación en el mapa y su sitio web.",
    singular: "museo", plural: "museos", nuevo: "Nuevo",
    campos: [
      { clave: "name", etiqueta: "Nombre", tipo: "texto", requerido: true },
      { clave: "description", etiqueta: "Descripción", tipo: "area" },
      { clave: "latitude", etiqueta: "Latitud", tipo: "numero", step: "any", min: -90, max: 90, ancho: "mitad", ayuda: "Entre -90 y 90. Ej.: 5.5353" },
      { clave: "longitude", etiqueta: "Longitud", tipo: "numero", step: "any", min: -180, max: 180, ancho: "mitad", ayuda: "Entre -180 y 180. Ej.: -73.3678" },
      { clave: "landingPageUrl", etiqueta: "Sitio web", tipo: "url", ayuda: "Debe empezar por http:// o https://" },
    ],
    columnas: [
      { titulo: "Museo", valor: (m) => `<strong>${esc(m.name)}</strong><span class="secundario">${esc(recortar(m.description, 120))}</span>` },
      {
        titulo: "Ubicación",
        valor: (m) => (m.latitude !== null && m.longitude !== null)
          ? `<a href="https://www.openstreetmap.org/?mlat=${m.latitude}&mlon=${m.longitude}#map=16/${m.latitude}/${m.longitude}" target="_blank" rel="noopener">${Number(m.latitude).toFixed(4)}, ${Number(m.longitude).toFixed(4)}</a>`
          : "—",
      },
      { titulo: "Sitio web", valor: (m) => enlace(m.landingPageUrl) },
    ],
  },

  salas: {
    ruta: "/rooms",
    titulo: "Salas de exposición",
    intro: "Las salas de cada museo y cuántas personas caben en ellas.",
    singular: "sala", plural: "salas", nuevo: "Nueva",
    campos: [
      { clave: "museum", etiqueta: "Museo", tipo: "select", requerido: true, origen: "/museums", opcion: (m) => m.name, vacio: "Elige un museo…", ancho: "mitad" },
      { clave: "name", etiqueta: "Nombre", tipo: "texto", requerido: true, ancho: "mitad" },
      { clave: "capacity", etiqueta: "Capacidad (personas)", tipo: "numero", min: 1, requerido: true, ancho: "mitad" },
      { clave: "description", etiqueta: "Descripción", tipo: "area" },
    ],
    columnas: [
      { titulo: "Sala", valor: (s) => `<strong>${esc(s.name)}</strong><span class="secundario">${esc(recortar(s.description, 120))}</span>` },
      { titulo: "Museo", valor: (s) => esc(s.museum ? s.museum.name : "—") },
      { titulo: "Capacidad", valor: (s) => `${esc(s.capacity)} personas` },
    ],
  },

  categorias: {
    ruta: "/categories",
    titulo: "Categorías",
    intro: "Cómo se clasifican los objetos para organizarlos y encontrarlos.",
    singular: "categoría", plural: "categorías", nuevo: "Nueva",
    campos: [
      { clave: "name", etiqueta: "Nombre", tipo: "texto", requerido: true },
      { clave: "description", etiqueta: "Descripción", tipo: "area" },
    ],
    columnas: [
      { titulo: "Categoría", valor: (c) => `<strong>${esc(c.name)}</strong>` },
      { titulo: "Descripción", valor: (c) => esc(recortar(c.description, 200)) || "—" },
    ],
  },

  artistas: {
    ruta: "/artists",
    titulo: "Artistas",
    intro: "Las personas que crearon las obras. Cada objeto tiene como máximo un artista.",
    singular: "artista", plural: "artistas", nuevo: "Nuevo",
    campos: [
      { clave: "name", etiqueta: "Nombre", tipo: "texto", requerido: true, ancho: "mitad" },
      { clave: "nationality", etiqueta: "Nacionalidad", tipo: "texto", ancho: "mitad" },
      { clave: "biography", etiqueta: "Biografía", tipo: "area" },
    ],
    columnas: [
      { titulo: "Artista", valor: (a) => `<strong>${esc(a.name)}</strong>` },
      { titulo: "Nacionalidad", valor: (a) => esc(a.nationality) || "—" },
      { titulo: "Biografía", valor: (a) => esc(recortar(a.biography, 160)) || "—" },
    ],
  },
};

montarCrud(VISTAS[document.body.dataset.pagina]);

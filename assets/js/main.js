/* Los datos vienen de contenido.json (los carga motor.js en window.INVITACION) */
const DATOS = window.INVITACION;

/* Cuenta regresiva: la fecha se cambia en evento.inicio de contenido.json */
const fechaEvento = new Date(DATOS.evento.inicio).getTime();
const ids = ["dias", "horas", "minutos", "segundos"];
const timer =
  document.getElementById("dias") &&
  setInterval(() => {
    const d = Math.max(0, fechaEvento - Date.now());
    const valores = [
      Math.floor(d / 86400000),
      Math.floor((d % 86400000) / 3600000),
      Math.floor((d % 3600000) / 60000),
      Math.floor((d % 60000) / 1000),
    ];
    ids.forEach((id, i) => (document.getElementById(id).innerText = valores[i]));
    if (d === 0) clearInterval(timer);
  }, 1000);

/* Reloj de cantina: las manecillas arrancan en la hora real
   (un retraso negativo adelanta cada animación hasta la hora de ahora) */
const caratula = document.querySelector(".reloj-caratula");
if (caratula) {
  const ahora = new Date();
  const segundos = (ahora.getHours() % 12) * 3600 + ahora.getMinutes() * 60 + ahora.getSeconds();
  caratula.style.setProperty("--ahora", -segundos + "s");
}

/* Música */
const music = document.getElementById("music");
const playPauseBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("progressBar");
const musicCard = document.getElementById("musicCard");
/* Barras del espectro: 12 de cada lado (cambia el número para más o menos barras) */
document.querySelectorAll(".espectro").forEach((e) => (e.innerHTML = "<span></span>".repeat(12)));
if (music) {
  music.volume = 0.5;
  playPauseBtn.addEventListener("click", () => (music.paused ? music.play() : music.pause()));
  /* El espectro se mueve solo mientras suena (clase "sonando") */
  music.addEventListener("play", () => {
    playPauseBtn.textContent = "⏸";
    musicCard?.classList.add("sonando");
  });
  music.addEventListener("pause", () => {
    playPauseBtn.textContent = "▶";
    musicCard?.classList.remove("sonando");
  });
  if (progressBar) {
    music.addEventListener("timeupdate", () => {
      progressBar.style.width = (music.currentTime / music.duration) * 100 + "%";
    });
  }
}

/* Puertas de cantina: se abren y dejan ver la invitación detrás */
document.getElementById("abrirPuertas").addEventListener("click", () => {
  const pantalla = document.getElementById("cantinaScreen");
  if (pantalla.classList.contains("abiertas")) return;
  document.getElementById("invitationContent").classList.remove("hidden");
  document.getElementById("invitationContent").classList.add("entrando");
  pantalla.classList.add("abiertas");
  if (music) music.play().catch(() => {});
  setTimeout(() => pantalla.classList.add("fade-out"), 2300);
});

/* Galería */
const sliderTrack = document.getElementById("sliderTrack");
if (sliderTrack) {
  const total = sliderTrack.children.length;
  const contenedor = sliderTrack.parentElement;
  let actual = 0;
  const ajustarAltura = () => {
    const alto = sliderTrack.children[actual].offsetHeight;
    if (alto) contenedor.style.height = alto + "px";
  };
  [...sliderTrack.children].forEach((img) => img.addEventListener("load", ajustarAltura));
  window.addEventListener("resize", ajustarAltura);
  setInterval(() => {
    actual = (actual + 1) % total;
    sliderTrack.style.transform = `translateX(-${actual * 100}%)`;
    ajustarAltura();
  }, 3500);
}

/* Confirmación por WhatsApp: el número va en confirmacion.whatsapp de contenido.json (ej. 5215512345678) */
document.querySelectorAll(".rsvp-form").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { whatsapp, mensajeWhatsapp: t } = DATOS.confirmacion;
    const datos = new FormData(form);
    let texto =
      `${t.saludo}\n` +
      `${t.nombre}: ${datos.get("nombre").trim()}\n` +
      `${t.asistentes}: ${datos.get("personas")}`;
    const mensaje = (datos.get("mensaje") || "").trim();
    if (mensaje) texto += `\n${t.mensaje}: ${mensaje}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(texto)}`, "_blank");
  });
});

/* Calendario: muestra el mes del evento y los botones para agregarlo (datos en evento y calendario de contenido.json) */
const seccionCal = document.getElementById("calendario");
if (seccionCal) {
  const fechaCal = new Date(DATOS.evento.inicio);
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const anio = fechaCal.getFullYear();
  const mes = fechaCal.getMonth();
  const primerDia = new Date(anio, mes, 1).getDay();
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  let celdas = ["D", "L", "M", "M", "J", "V", "S"].map((d) => `<span class="dia-semana">${d}</span>`).join("");
  celdas += "<span></span>".repeat(primerDia);
  for (let d = 1; d <= diasMes; d++) {
    celdas += `<span class="${d === fechaCal.getDate() ? "dia-evento" : ""}">${d}</span>`;
  }

  /* Fechas en formato AAAAMMDDTHHMMSS (hora local), como lo piden Google Calendar y los .ics */
  const pad = (n) => String(n).padStart(2, "0");
  const finCal = new Date(fechaCal.getTime() + DATOS.evento.duracionHoras * 3600000);
  const formato = (f) => `${f.getFullYear()}${pad(f.getMonth() + 1)}${pad(f.getDate())}T${pad(f.getHours())}${pad(f.getMinutes())}00`;
  const titulo = DATOS.evento.tituloCalendario;
  const lugar = DATOS.evento.lugarCalendario;
  const google =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(titulo)}&dates=${formato(fechaCal)}/${formato(finCal)}&location=${encodeURIComponent(lugar)}`;

  seccionCal.innerHTML = `
    <div class="calendario-card">
      <h2 class="calendario-titulo">${DATOS.calendario.titulo}</h2>
      <p class="calendario-mes">${meses[mes]} ${anio}</p>
      <div class="calendario-grid">${celdas}</div>
      <div class="calendario-botones">
        <a class="place-btn" href="${google}" target="_blank" rel="noopener">${DATOS.calendario.botonGoogle}</a>
        <button class="place-btn" id="descargarIcs" type="button">${DATOS.calendario.botonIcs}</button>
      </div>
    </div>`;

  document.getElementById("descargarIcs").addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Mirai//Invitacion//ES",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@mirai`,
      `DTSTART:${formato(fechaCal)}`,
      `DTEND:${formato(finCal)}`,
      `SUMMARY:${titulo}`,
      `LOCATION:${lugar}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${titulo}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    enlace.download = "evento.ics";
    enlace.click();
  });
}

/* Animaciones de entrada: cada bloque sube y aparece al llegar a la pantalla (.revelar en style.css).
   Se marca desde aquí para que, sin JS o con "reducir movimiento", todo se vea desde el inicio */
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if ("IntersectionObserver" in window && !sinMovimiento) {
  const bloques = document.querySelectorAll(
    ".section-home .home-title, .section-music, .section-sebusca .cartel, .letrero, .grabado > *, .section-timer h2, .reloj, .place-card, .section-calendario, .cronograma li, .section-slider, .info-block, .info-separator, .section-message > *"
  );
  const observador = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }),
    { threshold: 0.15 }
  );
  /* Escalonado: cada bloque entra un poco después que el anterior (tres pasos y se repite) */
  bloques.forEach((bloque, i) => {
    bloque.classList.add("revelar");
    bloque.style.setProperty("--retraso", (i % 3) * 0.12 + "s");
    observador.observe(bloque);
  });
}

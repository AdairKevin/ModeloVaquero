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

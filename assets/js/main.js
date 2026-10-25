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
if (music) {
  music.volume = 0.5;
  playPauseBtn.addEventListener("click", () => (music.paused ? music.play() : music.pause()));
  music.addEventListener("play", () => (playPauseBtn.textContent = "⏸"));
  music.addEventListener("pause", () => (playPauseBtn.textContent = "▶"));
  music.addEventListener("timeupdate", () => {
    progressBar.style.width = (music.currentTime / music.duration) * 100 + "%";
  });
}

/* Sobre */
document.getElementById("openEnvelope").addEventListener("click", () => {
  document.querySelector(".envelope").classList.add("open");
  if (music) music.play().catch(() => {});
  setTimeout(() => {
    document.getElementById("envelopeScreen").classList.add("fade-out");
    document.getElementById("invitationContent").classList.remove("hidden");
  }, 1200);
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

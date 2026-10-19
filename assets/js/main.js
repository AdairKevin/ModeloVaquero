/* Cuenta regresiva: cambia la fecha del evento */
const fechaEvento = new Date("Jan 1, 2027 16:00:00").getTime();
const ids = ["dias", "horas", "minutos", "segundos"];
const timer = setInterval(() => {
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
music.volume = 0.5;
playPauseBtn.addEventListener("click", () => (music.paused ? music.play() : music.pause()));
music.addEventListener("play", () => (playPauseBtn.textContent = "⏸"));
music.addEventListener("pause", () => (playPauseBtn.textContent = "▶"));
music.addEventListener("timeupdate", () => {
  progressBar.style.width = (music.currentTime / music.duration) * 100 + "%";
});

/* Sobre */
document.getElementById("openEnvelope").addEventListener("click", () => {
  document.querySelector(".envelope").classList.add("open");
  music.play().catch(() => {});
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
  window.addEventListener("load", ajustarAltura);
  window.addEventListener("resize", ajustarAltura);
  setInterval(() => {
    actual = (actual + 1) % total;
    sliderTrack.style.transform = `translateX(-${actual * 100}%)`;
    ajustarAltura();
  }, 3500);
}

/* Confirmación por WhatsApp: pon el número en data-whatsapp (ej. 5215512345678) */
document.querySelectorAll(".rsvp-form").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = new FormData(form);
    let texto =
      `¡Hola! Confirmo mi asistencia a ${form.dataset.evento}.\n` +
      `Nombre: ${datos.get("nombre").trim()}\n` +
      `Número de asistentes: ${datos.get("personas")}`;
    const mensaje = (datos.get("mensaje") || "").trim();
    if (mensaje) texto += `\nMensaje: ${mensaje}`;
    window.open(`https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(texto)}`, "_blank");
  });
});

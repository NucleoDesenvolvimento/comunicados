/*
====================================================
NucleoDesenvolvimento UI
Projeto: Central de Comunicados
Versão 5.2.1
====================================================
*/
"use strict";

const App = {
  comunicados: [],
  indice: 0,
  animando: false,
  touchStartX: 0,
  touchEndX: 0,
  el: {},
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  App.el = {
    card: document.getElementById("carouselCard"),
    dots: document.getElementById("carouselDots"),
    prev: document.getElementById("btnPrev"),
    next: document.getElementById("btnNext"),
    footer: document.getElementById("footer-text"),
    toast: document.getElementById("toastCopiado"),
  };

  if (App.el.card) {
    App.el.card.style.transition = "opacity .28s ease, transform .28s ease";
    App.el.card.style.willChange = "opacity, transform";
    App.el.card.style.touchAction = "pan-y";
  }

  atualizarAno();

  App.el.prev?.addEventListener("click", () => trocar(-1));
  App.el.next?.addEventListener("click", () => trocar(1));

  document.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
    switch (e.key) {
      case "ArrowLeft":
        trocar(-1);
        break;
      case "ArrowRight":
        trocar(1);
        break;
      case "Home":
        if (App.comunicados.length) {
          App.indice = 0;
          renderAnimado(-1);
        }
        break;
      case "End":
        if (App.comunicados.length) {
          App.indice = App.comunicados.length - 1;
          renderAnimado(1);
        }
        break;
    }
  });

  App.el.card?.addEventListener(
    "touchstart",
    (e) => {
      App.touchStartX = e.changedTouches[0].clientX;
    },
    { passive: true },
  );

  App.el.card?.addEventListener(
    "touchend",
    (e) => {
      App.touchEndX = e.changedTouches[0].clientX;
      const delta = App.touchStartX - App.touchEndX;
      if (Math.abs(delta) < 60) return;
      delta > 0 ? trocar(1) : trocar(-1);
    },
    { passive: true },
  );

  await carregar();
}

async function carregar() {
  const r = await fetch("assets/data/comunicados.json", { cache: "no-store" });
  App.comunicados = (await r.json())
    .filter((x) => x.ativo)
    .sort((a, b) => (a.ordem ?? 9999) - (b.ordem ?? 9999));
  render();
}

function trocar(dir) {
  if (App.animando || App.comunicados.length < 2) return;
  App.indice =
    (App.indice + dir + App.comunicados.length) % App.comunicados.length;
  renderAnimado(dir);
}

function renderAnimado(dir = 1) {
  if (App.animando) return;
  App.animando = true;

  const el = App.el.card;

  el.style.opacity = "0";
  el.style.transform = `translateX(${dir > 0 ? 25 : -25}px)`;

  setTimeout(() => {
    render();
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateX(0)";
    });
    setTimeout(() => (App.animando = false), 300);
  }, 180);
}

function render() {
  if (!App.comunicados.length) {
    App.el.card.innerHTML =
      '<div class="alert alert-warning">Nenhum comunicado.</div>';
    return;
  }

  const c = App.comunicados[App.indice];

  App.el.card.innerHTML = `
<div class="card aviso-card">
<div class="card-body">
<i class="bi ${c.icone || "bi-megaphone-fill"}"></i>
<h2>${esc(c.titulo)}</h2>
<p class="mb-4">${esc(c.descricao)}</p>
<div class="d-flex flex-wrap gap-2 mb-4">
<span class="badge bg-${c.cor || "primary"}">${esc(c.categoria || "Aviso")}</span>
<span class="badge bg-dark">${fmt(c.data)}</span>
</div>
${c.url ? `<a href="${c.url}" target="_blank" class="btn btn-primary">Abrir comunicado</a>` : ""}
</div>
</div>`;

  App.el.dots.innerHTML = App.comunicados
    .map(
      (_, i) =>
        `<button class="${i === App.indice ? "active" : ""}" data-i="${i}"></button>`,
    )
    .join("");

  App.el.dots.querySelectorAll("button").forEach((b) => {
    b.onclick = () => {
      if (App.animando) return;
      App.indice = Number(b.dataset.i);
      renderAnimado();
    };
  });

  const unica = App.comunicados.length <= 1;
  if (App.el.prev) App.el.prev.disabled = unica;
  if (App.el.next) App.el.next.disabled = unica;
}

const fmt = (d) => (d ? new Date(d).toLocaleDateString("pt-BR") : "");

const esc = (t) =>
  String(t ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function copiarEmail() {
  navigator.clipboard.writeText("blindajedigital@blindajedigital.online");
  new bootstrap.Toast(App.el.toast).show();
}

function atualizarAno() {
  if (App.el.footer) {
    App.el.footer.firstChild.textContent = `© ${new Date().getFullYear()} • `;
  }
}

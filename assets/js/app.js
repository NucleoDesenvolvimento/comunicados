/*
====================================================
NucleoDesenvolvimento UI
Projeto: Central de Comunicados
Versão 5.0
====================================================
*/
"use strict";

const App={
 comunicados:[],
 indice:0,
 el:{}
};

document.addEventListener("DOMContentLoaded",init);

async function init(){
 App.el={
  card:document.getElementById("carouselCard"),
  dots:document.getElementById("carouselDots"),
  prev:document.getElementById("btnPrev"),
  next:document.getElementById("btnNext"),
  footer:document.getElementById("footer-text"),
  toast:document.getElementById("toastCopiado")
 };

 atualizarAno();

 App.el.prev?.addEventListener("click",anterior);
 App.el.next?.addEventListener("click",proximo);

 document.addEventListener("keydown",e=>{
   if(e.key==="ArrowLeft") anterior();
   if(e.key==="ArrowRight") proximo();
 });

 await carregar();
}

async function carregar(){
 const r=await fetch("assets/data/comunicados.json",{cache:"no-store"});
 App.comunicados=(await r.json())
   .filter(x=>x.ativo)
   .sort((a,b)=>(a.ordem??9999)-(b.ordem??9999));

 render();
}

function render(){
 if(!App.comunicados.length){
   App.el.card.innerHTML='<div class="alert alert-warning">Nenhum comunicado.</div>';
   return;
 }

 const c=App.comunicados[App.indice];

 App.el.card.innerHTML=`
<div class="card aviso-card">
<div class="card-body">
<i class="bi ${c.icone||'bi-megaphone-fill'}"></i>
<h2>${esc(c.titulo)}</h2>
<p class="mb-4">${esc(c.descricao)}</p>
<div class="d-flex flex-wrap gap-2 mb-4">
<span class="badge bg-${c.cor||'primary'}">${esc(c.categoria||'Aviso')}</span>
<span class="badge bg-dark">${fmt(c.data)}</span>
</div>
${c.url?`<a href="${c.url}" target="_blank" class="btn btn-primary">Abrir comunicado</a>`:""}
</div>
</div>`;

 App.el.dots.innerHTML=App.comunicados.map((_,i)=>
 `<button class="${i===App.indice?'active':''}" data-i="${i}"></button>`).join("");

 App.el.dots.querySelectorAll("button").forEach(b=>{
  b.onclick=()=>{
   App.indice=Number(b.dataset.i);
   render();
  };
 });
}

function proximo(){
 App.indice=(App.indice+1)%App.comunicados.length;
 render();
}

function anterior(){
 App.indice=(App.indice-1+App.comunicados.length)%App.comunicados.length;
 render();
}

function fmt(d){
 return d?new Date(d).toLocaleDateString("pt-BR"):"";
}

function esc(t){
 return String(t??"")
 .replace(/&/g,"&amp;")
 .replace(/</g,"&lt;")
 .replace(/>/g,"&gt;")
 .replace(/"/g,"&quot;");
}

function copiarEmail(){
 navigator.clipboard.writeText("blindajedigital@blindajedigital.online");
 new bootstrap.Toast(App.el.toast).show();
}

function atualizarAno(){
 if(App.el.footer){
  App.el.footer.firstChild.textContent=`© ${new Date().getFullYear()} • `;
 }
}

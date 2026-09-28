import{t as e}from"./api-B-s7tTxe.js";var t=e(`/api/pizzas`),n=e(`/api/pedidos`),r=[],i=[];function a(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}function o(e){return`$${Number(e).toLocaleString(`es-CO`)}`}function s(e){let t=a(e.nombre);return e.imagen_url?`<img src="${a(e.imagen_url)}" alt="${t}" loading="lazy" decoding="async" width="480" height="360" />`:`<div class="pizza-placeholder" aria-hidden="true">🍕</div>`}function c(){return r.reduce((e,t)=>e+t.cantidad,0)}function l(){return r.reduce((e,t)=>e+Number(t.precio)*t.cantidad,0)}function u(){let e=document.querySelector(`#carrito-count`),t=document.querySelector(`#carrito-total`);e&&(e.textContent=String(c())),t&&(t.textContent=o(l()))}function d(){let e=document.querySelector(`#carrito-lista`),t=document.querySelector(`#carrito-vacio`),n=document.querySelector(`#carrito-acciones`);if(e){if(r.length===0){e.innerHTML=``,t&&(t.hidden=!1),n&&(n.hidden=!0),u();return}t&&(t.hidden=!0),n&&(n.hidden=!1),e.innerHTML=r.map(e=>`
        <article class="carrito-item">
          <div>
            <h4>${a(e.nombre)}</h4>
            <p>${o(e.precio)} c/u</p>
          </div>
          <div class="carrito-item-actions">
            <button type="button" data-action="menos" data-id="${e.pizza_id}" aria-label="Reducir cantidad">−</button>
            <span>${e.cantidad}</span>
            <button type="button" data-action="mas" data-id="${e.pizza_id}" aria-label="Aumentar cantidad">+</button>
            <button type="button" class="quitar" data-action="quitar" data-id="${e.pizza_id}">Quitar</button>
          </div>
        </article>
      `).join(``),u()}}function f(){let e=document.querySelector(`#pedido-resultado`);e&&(e.innerHTML=``)}function p(e){let t=i.find(t=>t.id===e);if(!t||!t.disponible)return;f();let n=r.find(t=>t.pizza_id===e);n?n.cantidad+=1:r.push({pizza_id:t.id,nombre:t.nombre,precio:t.precio,cantidad:1}),d(),g()}function m(e,t){let n=r.find(t=>t.pizza_id===e);if(n){if(f(),n.cantidad+=t,n.cantidad<=0){let t=r.findIndex(t=>t.pizza_id===e);r.splice(t,1)}d()}}function h(e){let t=r.findIndex(t=>t.pizza_id===e);t!==-1&&(f(),r.splice(t,1),d())}function g(){let e=document.querySelector(`#carrito-panel`),t=document.querySelector(`#carrito-fondo`);e?.classList.add(`abierto`),t?.classList.add(`visible`),e?.setAttribute(`aria-hidden`,`false`),document.body.classList.add(`carrito-abierto`)}function _(){let e=document.querySelector(`#carrito-panel`),t=document.querySelector(`#carrito-fondo`);e?.classList.remove(`abierto`),t?.classList.remove(`visible`),e?.setAttribute(`aria-hidden`,`true`),document.body.classList.remove(`carrito-abierto`)}function v(e){let t=document.querySelector(`#pedido-resultado`),n=document.querySelector(`#carrito-vacio`);n&&(n.hidden=!0),t&&(t.innerHTML=`
      <div class="pedido-exito" role="status">
        <h3>Pedido confirmado</h3>
        <p>Pedido #${a(e.id)}</p>
        <p>Total: ${o(e.total)}</p>
        <p>
          Código de confirmación:
          <strong>${a(e.codigo_confirmacion)}</strong>
        </p>
        <p class="pedido-ayuda">
          Guarda este código para retirar tu pedido en el local.
        </p>
      </div>
    `)}async function y(){let e=document.querySelector(`#btn-confirmar-pedido`);if(r.length!==0)try{e&&(e.disabled=!0,e.textContent=`Procesando...`);let t={pizzas:r.map(e=>({pizza_id:e.pizza_id,cantidad:e.cantidad}))},i=await fetch(n,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(t)}),a=await i.json();if(!i.ok)throw Error(a.error||`No se pudo crear el pedido`);let o=a.pedido.id,s=await fetch(`${n}/${o}/confirmar-pago`,{method:`POST`}),c=await s.json();if(!s.ok)throw Error(c.error||`No se pudo confirmar el pago`);r.splice(0,r.length),d(),v(c.pedido),await w()}catch(e){if(console.error(e),[`localhost`,`127.0.0.1`].includes(location.hostname)){let t=document.querySelector(`#pedido-resultado`);t&&(t.innerHTML=`
          <div class="pedido-error" role="alert">
            <p><strong>No se pudo procesar el pedido</strong></p>
            <p>${a(e.message||`Error desconocido`)}</p>
            <p class="pedido-ayuda">Asegúrate de que el backend esté corriendo: <code>docker compose up -d</code></p>
          </div>
        `)}else{let e=r.reduce((e,t)=>e+Number(t.precio)*t.cantidad,0),t=`PZ-${Math.random().toString(36).slice(2,8).toUpperCase()}`,n={id:Date.now().toString().slice(-6),total:e,codigo_confirmacion:t};r.splice(0,r.length),d(),v(n);let i=document.createElement(`p`);i.className=`pedido-ayuda`,i.style.cssText=`color:var(--color-muted,#888);font-size:.85em;margin-top:.5rem;`,i.textContent=`Vista de demostración: el servidor no está activo. Presenta este código en el local para confirmar.`,document.querySelector(`#pedido-resultado .pedido-exito`)?.appendChild(i)}}finally{e&&(e.disabled=!1,e.textContent=`Confirmar y pagar`)}}function b(e,t){let n=t??!e.classList.contains(`is-flipped`);document.querySelectorAll(`.pizza-card-3d.is-flipped`).forEach(t=>{t!==e&&(t.classList.remove(`is-flipped`),t.setAttribute(`aria-expanded`,`false`))}),e.classList.toggle(`is-flipped`,n),e.setAttribute(`aria-expanded`,n?`true`:`false`)}function x(){document.querySelector(`#btn-abrir-carrito`)?.addEventListener(`click`,g),document.querySelector(`#btn-abrir-carrito-contacto`)?.addEventListener(`click`,g),document.querySelector(`#btn-cerrar-carrito`)?.addEventListener(`click`,_),document.querySelector(`#carrito-fondo`)?.addEventListener(`click`,_),document.querySelector(`#btn-confirmar-pedido`)?.addEventListener(`click`,y),document.querySelector(`#carrito-lista`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let n=Number(t.dataset.id),r=t.dataset.action;r===`mas`&&m(n,1),r===`menos`&&m(n,-1),r===`quitar`&&h(n)}),document.querySelector(`#pizzas-cliente`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-add]`);if(t){e.stopPropagation(),p(Number(t.dataset.add));return}let n=e.target.closest(`.pizza-card-3d`);n&&b(n)}),document.querySelector(`#pizzas-cliente`)?.addEventListener(`keydown`,e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(`.pizza-card-3d`);t&&(e.preventDefault(),b(t))}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&_()}),d()}function S(){let e=document.querySelector(`#nav-toggle`),t=document.querySelector(`#site-nav`),n=document.querySelector(`.site-header`);e?.addEventListener(`click`,()=>{let n=t?.classList.toggle(`abierto`);e.setAttribute(`aria-expanded`,n?`true`:`false`)}),t?.querySelectorAll(`a`).forEach(n=>{n.addEventListener(`click`,()=>{t.classList.remove(`abierto`),e?.setAttribute(`aria-expanded`,`false`)})}),window.addEventListener(`scroll`,()=>{n?.classList.toggle(`scrolled`,window.scrollY>8)},{passive:!0})}async function C(){try{let e=await fetch(t);if(!e.ok)throw Error(`API no disponible`);let n=await e.json();if(!Array.isArray(n))throw Error(`Respuesta inválida del servidor`);return n}catch{let e=await fetch(`./menu.json`);if(!e.ok)throw Error(`No se pudo cargar el menú`);return e.json()}}async function w(){let e=document.querySelector(`#pizzas-cliente`);if(e)try{if(i=await C(),i.length===0){e.innerHTML=`<div class="menu-empty"><p>No hay pizzas disponibles.</p></div>`;return}e.innerHTML=i.map(e=>{let t=a(e.nombre),n=a(e.descripcion),r=e.disponible===!0||e.disponible===`t`||Number(e.stock)>0;return`
          <article class="pizza-card-3d ${r?``:`pizza-card-agotada`}"
            data-flip
            role="button"
            tabindex="0"
            aria-expanded="false"
            aria-label="${t}: tocar para ver detalles"
          >
            <div class="pizza-face pizza-face-1">
              <div class="pizza-face-top">
                <span class="pizza-badge-3d ${r?`disponible`:`agotada`} hide">
                  ${r?`✓ Disponible`:`✗ Agotada`}
                </span>
                <h3 class="pizza-nombre-3d hide">${t}</h3>
                <p class="pizza-desc-3d hide">${n}</p>
              </div>
              <div class="pizza-face-bottom">
                <strong class="pizza-precio-3d hide">${o(e.precio)}</strong>
                <span class="pizza-hint hide">👆 Ver detalles</span>
              </div>
            </div>

            <div class="pizza-face pizza-face-2">
              <div class="pizza-face-top">
                <h3 class="pizza-nombre-back hide">${t}</h3>
                <p class="pizza-desc-back hide">${n}</p>
              </div>
              <div class="pizza-face-bottom">
                <strong class="pizza-precio-back hide">${o(e.precio)}</strong>
                ${r?`<button type="button" class="btn-add-3d hide" data-add="${e.id}">🛒 Agregar al pedido</button>`:`<span class="btn-add-3d btn-add-3d-disabled hide">Sin stock</span>`}
              </div>
            </div>

            <div class="pizza-img-wrapper">
              <div class="pizza-img-float">
                ${s(e)}
              </div>
            </div>
          </article>
        `}).join(``)}catch(t){console.error(t),e.innerHTML=`
      <div class="menu-error" role="alert">
        <p>No pudimos conectar con el servidor.</p>
        <p class="menu-error-hint">Arranca el backend: docker compose up -d</p>
        <button type="button" class="btn btn-secondary" id="btn-reintentar-menu">Reintentar</button>
      </div>
    `,e.querySelector(`#btn-reintentar-menu`)?.addEventListener(`click`,()=>{location.reload()})}}S(),x(),w();
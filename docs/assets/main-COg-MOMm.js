import"./modulepreload-polyfill-P2Xu9kJm.js";var e=`http://localhost:3000/api/pizzas`,t=`http://localhost:3000/api/pedidos`,n=`./menu.json`,r=[],i=[];function a(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}function o(e){return`$${Number(e).toLocaleString(`es-CO`)}`}function s(){return`PZ-${Math.random().toString(36).slice(2,8).toUpperCase()}`}function c(e){let t=a(e.nombre);return e.imagen_url?`<img src="${a(e.imagen_url)}" alt="${t}" loading="lazy" decoding="async" width="480" height="360" />`:`<div class="pizza-placeholder" aria-hidden="true">🍕</div>`}function l(){return r.reduce((e,t)=>e+t.cantidad,0)}function u(){return r.reduce((e,t)=>e+Number(t.precio)*t.cantidad,0)}function d(){let e=document.querySelector(`#carrito-count`),t=document.querySelector(`#carrito-total`);e&&(e.textContent=String(l())),t&&(t.textContent=o(u()))}function f(){let e=document.querySelector(`#carrito-lista`),t=document.querySelector(`#carrito-vacio`),n=document.querySelector(`#carrito-acciones`);if(e){if(r.length===0){e.innerHTML=``,t&&(t.hidden=!1),n&&(n.hidden=!0),d();return}t&&(t.hidden=!0),n&&(n.hidden=!1),e.innerHTML=r.map(e=>`
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
      `).join(``),d()}}function p(){let e=document.querySelector(`#pedido-resultado`);e&&(e.innerHTML=``)}function m(e){let t=i.find(t=>t.id===e);if(!t||!t.disponible)return;p();let n=r.find(t=>t.pizza_id===e);n?n.cantidad+=1:r.push({pizza_id:t.id,nombre:t.nombre,precio:t.precio,cantidad:1}),f(),_()}function h(e,t){let n=r.find(t=>t.pizza_id===e);if(n){if(p(),n.cantidad+=t,n.cantidad<=0){let t=r.findIndex(t=>t.pizza_id===e);r.splice(t,1)}f()}}function g(e){let t=r.findIndex(t=>t.pizza_id===e);t!==-1&&(p(),r.splice(t,1),f())}function _(){let e=document.querySelector(`#carrito-panel`),t=document.querySelector(`#carrito-fondo`);e?.classList.add(`abierto`),t?.classList.add(`visible`),e?.setAttribute(`aria-hidden`,`false`),document.body.classList.add(`carrito-abierto`)}function v(){let e=document.querySelector(`#carrito-panel`),t=document.querySelector(`#carrito-fondo`);e?.classList.remove(`abierto`),t?.classList.remove(`visible`),e?.setAttribute(`aria-hidden`,`true`),document.body.classList.remove(`carrito-abierto`)}function y(e){let t=document.querySelector(`#pedido-resultado`),n=document.querySelector(`#carrito-vacio`);n&&(n.hidden=!0),t&&(t.innerHTML=`
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
    `)}async function b(){let e=document.querySelector(`#btn-confirmar-pedido`);if(r.length!==0)try{e&&(e.disabled=!0,e.textContent=`Procesando...`);let n={pizzas:r.map(e=>({pizza_id:e.pizza_id,cantidad:e.cantidad}))},i=await fetch(t,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(n)}),a=await i.json();if(!i.ok)throw Error(a.error||`No se pudo crear el pedido`);let o=a.pedido.id,s=await fetch(`${t}/${o}/confirmar-pago`,{method:`POST`}),c=await s.json();if(!s.ok)throw Error(c.error||`No se pudo confirmar el pago`);r.splice(0,r.length),f(),y(c.pedido),await T()}catch(e){if([`localhost`,`127.0.0.1`].includes(location.hostname)){console.error(e),alert(e.message||`No se pudo confirmar el pedido`);return}let t={id:`demo`,total:u(),codigo_confirmacion:s()};r.splice(0,r.length),f(),y(t);let n=document.createElement(`p`);n.className=`pedido-ayuda`,n.textContent=`Vista de GitHub: el backend no está conectado. Este código es de demostración.`,document.querySelector(`#pedido-resultado .pedido-exito`)?.appendChild(n)}finally{e&&(e.disabled=!1,e.textContent=`Confirmar y pagar`)}}function x(e,t){let n=e.querySelector(`.flip-card-inner`);if(!n)return;let r=t??!e.classList.contains(`is-flipped`);document.querySelectorAll(`.flip-card.is-flipped`).forEach(t=>{t!==e&&(t.classList.remove(`is-flipped`),t.querySelector(`.flip-card-inner`)?.setAttribute(`aria-expanded`,`false`))}),e.classList.toggle(`is-flipped`,r),n.setAttribute(`aria-expanded`,r?`true`:`false`)}function S(){document.querySelector(`#btn-abrir-carrito`)?.addEventListener(`click`,_),document.querySelector(`#btn-abrir-carrito-contacto`)?.addEventListener(`click`,_),document.querySelector(`#btn-cerrar-carrito`)?.addEventListener(`click`,v),document.querySelector(`#carrito-fondo`)?.addEventListener(`click`,v),document.querySelector(`#btn-confirmar-pedido`)?.addEventListener(`click`,b),document.querySelector(`#carrito-lista`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let n=Number(t.dataset.id),r=t.dataset.action;r===`mas`&&h(n,1),r===`menos`&&h(n,-1),r===`quitar`&&g(n)}),document.querySelector(`#pizzas-cliente`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-add]`);if(t){e.stopPropagation(),m(Number(t.dataset.add));return}let n=e.target.closest(`[data-flip]`),r=e.target.closest(`.flip-card`);n&&r&&x(r)}),document.querySelector(`#pizzas-cliente`)?.addEventListener(`keydown`,e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(`.flip-card-inner`),n=e.target.closest(`.flip-card`);!t||!n||(e.preventDefault(),x(n))}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&v()}),f()}function C(){let e=document.querySelector(`#nav-toggle`),t=document.querySelector(`#site-nav`),n=document.querySelector(`.site-header`);e?.addEventListener(`click`,()=>{let n=t?.classList.toggle(`abierto`);e.setAttribute(`aria-expanded`,n?`true`:`false`)}),t?.querySelectorAll(`a`).forEach(n=>{n.addEventListener(`click`,()=>{t.classList.remove(`abierto`),e?.setAttribute(`aria-expanded`,`false`)})}),window.addEventListener(`scroll`,()=>{n?.classList.toggle(`scrolled`,window.scrollY>8)},{passive:!0})}async function w(){try{let t=await fetch(e);if(!t.ok)throw Error(`API no disponible`);let n=await t.json();if(!Array.isArray(n)||n.length===0)throw Error(`Catálogo vacío`);return n}catch{let e=await fetch(n);if(!e.ok)throw Error(`No se pudo cargar el menú`);return e.json()}}async function T(){let e=document.querySelector(`#pizzas-cliente`);if(e)try{if(i=await w(),i.length===0){e.innerHTML=`<div class="menu-empty"><p>No hay pizzas disponibles.</p></div>`;return}e.innerHTML=i.map(e=>{let t=a(e.nombre),n=a(e.descripcion),r=!!e.disponible;return`
          <article class="flip-card">
            <div class="flip-card-scene">
              <div
                class="flip-card-inner"
                data-flip
                role="button"
                tabindex="0"
                aria-expanded="false"
                aria-label="${t}: tocar para ver detalles"
              >
                <div class="flip-card-face flip-card-front">
                  <div class="pizza-image">
                    ${c(e)}
                    <span class="pizza-badge ${r?`disponible`:`agotada`}">
                      ${r?`Disponible`:`Agotada`}
                    </span>
                  </div>
                  <div class="pizza-info">
                    <h3>${t}</h3>
                    <strong>${o(e.precio)}</strong>
                    <span class="flip-hint">Toca para voltear</span>
                  </div>
                </div>
                <div class="flip-card-face flip-card-back">
                  <div class="pizza-info">
                    <h3>${t}</h3>
                    <p>${n}</p>
                    <strong>${o(e.precio)}</strong>
                    ${r?`<button type="button" class="btn-add" data-add="${e.id}">Agregar al pedido</button>`:`<span class="btn-add btn-add-disabled">Agotada</span>`}
                    <span class="flip-hint">Toca para volver</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        `}).join(``)}catch(t){console.error(t),e.innerHTML=`
      <div class="menu-error" role="alert">
        <p>No pudimos cargar el menú.</p>
        <button type="button" class="btn btn-secondary" id="btn-reintentar-menu">Reintentar</button>
      </div>
    `,e.querySelector(`#btn-reintentar-menu`)?.addEventListener(`click`,()=>{location.reload()})}}C(),S(),T();
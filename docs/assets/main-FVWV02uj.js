import{t as e}from"./api-B-s7tTxe.js";var t=`573122759195`;function n(e){return`https://wa.me/${t}?text=${encodeURIComponent(e)}`}var r=e(`/api/pizzas`),i=[],a=[],o=`todo`,s=``,c=!1,l=`featured`;function u(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}function d(e){return`$${Number(e).toLocaleString(`es-CO`)}`}function f(e){return String(e).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).toLowerCase()}function p(e){if(e.categoria||e.category)return String(e.categoria||e.category);let t=f(e.nombre);return/margarita|pepperoni|hawaiana/.test(t)?`Pizzas clásicas`:/pizza|quesos|bbq|pollo/.test(t)?`Pizzas especiales`:`Otros`}function m(e){return e.disponible===!0||e.disponible===`t`||Number(e.stock)>0}function h(e){let t=u(e.nombre);return e.imagen_url?`<img src="${u(e.imagen_url)}" alt="${t}" loading="lazy" decoding="async" width="480" height="360" />`:`<div class="pizza-placeholder" aria-hidden="true">🍕</div>`}function g(){return i.reduce((e,t)=>e+t.cantidad,0)}function _(){return i.reduce((e,t)=>e+Number(t.precio)*t.cantidad,0)}function v(){let e=document.querySelector(`#carrito-count`),t=document.querySelector(`#carrito-total`),r=document.querySelector(`#btn-whatsapp-pedido`);e&&(e.textContent=String(g())),t&&(t.textContent=d(_())),r&&i.length>0&&(r.href=n(`Hola, El Callejón. Quiero hacer este pedido:\n\n${i.map(e=>`- ${e.cantidad} x ${e.nombre}: ${d(Number(e.precio)*e.cantidad)}`).join(`
`)}\n\nTotal: ${d(_())}`))}function y(){let e=document.querySelector(`#carrito-lista`),t=document.querySelector(`#carrito-vacio`),n=document.querySelector(`#carrito-acciones`);if(e){if(i.length===0){e.innerHTML=``,t&&(t.hidden=!1),n&&(n.hidden=!0),v();return}t&&(t.hidden=!0),n&&(n.hidden=!1),e.innerHTML=i.map(e=>`
        <article class="carrito-item">
          <div>
            <h4>${u(e.nombre)}</h4>
            <p>${d(e.precio)} c/u</p>
          </div>
          <div class="carrito-item-actions">
            <button type="button" data-action="menos" data-id="${e.pizza_id}" aria-label="Reducir cantidad">−</button>
            <span>${e.cantidad}</span>
            <button type="button" data-action="mas" data-id="${e.pizza_id}" aria-label="Aumentar cantidad">+</button>
            <button type="button" class="quitar" data-action="quitar" data-id="${e.pizza_id}">Quitar</button>
          </div>
        </article>
      `).join(``),v()}}function b(e){let t=a.find(t=>t.id===e);if(!t||!m(t))return;let n=i.find(t=>t.pizza_id===e);n?n.cantidad+=1:i.push({pizza_id:t.id,nombre:t.nombre,precio:t.precio,cantidad:1}),y(),C()}function x(e,t){let n=i.find(t=>t.pizza_id===e);if(n){if(n.cantidad+=t,n.cantidad<=0){let t=i.findIndex(t=>t.pizza_id===e);i.splice(t,1)}y()}}function S(e){let t=i.findIndex(t=>t.pizza_id===e);t!==-1&&(i.splice(t,1),y())}function C(){let e=document.querySelector(`#carrito-panel`),t=document.querySelector(`#carrito-fondo`);e?.classList.add(`abierto`),t?.classList.add(`visible`),e?.setAttribute(`aria-hidden`,`false`),document.body.classList.add(`carrito-abierto`)}function w(){let e=document.querySelector(`#carrito-panel`),t=document.querySelector(`#carrito-fondo`);e?.classList.remove(`abierto`),t?.classList.remove(`visible`),e?.setAttribute(`aria-hidden`,`true`),document.body.classList.remove(`carrito-abierto`)}function T(e,t){let n=t??!e.classList.contains(`is-flipped`);document.querySelectorAll(`.pizza-card-3d.is-flipped`).forEach(t=>{t!==e&&(t.classList.remove(`is-flipped`),t.setAttribute(`aria-expanded`,`false`))}),e.classList.toggle(`is-flipped`,n),e.setAttribute(`aria-expanded`,n?`true`:`false`)}function E(){document.querySelector(`#btn-abrir-carrito`)?.addEventListener(`click`,C),document.querySelector(`#btn-abrir-carrito-contacto`)?.addEventListener(`click`,C),document.querySelector(`#btn-cerrar-carrito`)?.addEventListener(`click`,w),document.querySelector(`#carrito-fondo`)?.addEventListener(`click`,w),document.querySelector(`#carrito-lista`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let n=Number(t.dataset.id),r=t.dataset.action;r===`mas`&&x(n,1),r===`menos`&&x(n,-1),r===`quitar`&&S(n)}),document.querySelector(`#pizzas-cliente`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-add]`);if(t){e.stopPropagation(),b(Number(t.dataset.add));return}let n=e.target.closest(`.pizza-card-3d`);n&&T(n)}),document.querySelector(`#pizzas-cliente`)?.addEventListener(`keydown`,e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(`.pizza-card-3d`);t&&(e.preventDefault(),T(t))}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&w()}),y()}function D(){let e=document.querySelector(`#nav-toggle`),t=document.querySelector(`#site-nav`),r=document.querySelector(`.site-header`);document.querySelectorAll(`[data-whatsapp-link]`).forEach(e=>{e.href=n(`Hola, quisiera información sobre el menú de El Callejón.`)}),e?.addEventListener(`click`,()=>{let n=t?.classList.toggle(`abierto`);e.setAttribute(`aria-expanded`,n?`true`:`false`)}),t?.querySelectorAll(`a`).forEach(n=>{n.addEventListener(`click`,()=>{t.classList.remove(`abierto`),e?.setAttribute(`aria-expanded`,`false`)})}),window.addEventListener(`scroll`,()=>{r?.classList.toggle(`scrolled`,window.scrollY>8)},{passive:!0})}function O(){let e=document.querySelector(`#menu-categories`);if(!e)return;let t=[...new Set(a.map(p))];e.innerHTML=[{id:`todo`,nombre:`Todo`,cantidad:a.length},...t.map(e=>({id:f(e),nombre:e,cantidad:a.filter(t=>p(t)===e).length}))].map(e=>`
        <button type="button" class="menu-category${o===e.id?` activo`:``}"
          data-category="${u(e.id)}" aria-pressed="${o===e.id}">
          <span>${u(e.nombre)}</span>
          <span class="category-count">${e.cantidad}</span>
        </button>
      `).join(``)}function k(){let e=a.filter(e=>{let t=p(e),n=o===`todo`||f(t)===o,r=f(`${e.nombre} ${e.descripcion||``}`).includes(f(s)),i=!c||m(e);return n&&r&&i});return l===`price-asc`?e=e.sort((e,t)=>Number(e.precio)-Number(t.precio)):l===`price-desc`?e=e.sort((e,t)=>Number(t.precio)-Number(e.precio)):l===`name`&&(e=e.sort((e,t)=>e.nombre.localeCompare(t.nombre,`es`))),e}function A(){let e=document.querySelector(`#pizzas-cliente`),t=document.querySelector(`#menu-results-count`);if(!e)return;let n=k();if(t&&(t.textContent=`Mostrando ${n.length} de ${a.length} ${a.length===1?`producto`:`productos`}`),n.length===0){e.innerHTML=`
      <div class="menu-empty" role="status">
        <p>No encontramos pizzas con esos filtros.</p>
        <button type="button" class="btn btn-secondary" id="clear-menu-filters">Limpiar filtros</button>
      </div>
    `,e.querySelector(`#clear-menu-filters`)?.addEventListener(`click`,()=>{o=`todo`,s=``,c=!1,l=`featured`;let e=document.querySelector(`#menu-search`),t=document.querySelector(`#available-only`),n=document.querySelector(`#menu-sort`);e&&(e.value=``),t&&(t.checked=!1),n&&(n.value=`featured`);let r=document.querySelector(`#clear-menu-search`);r&&(r.hidden=!0),O(),A()});return}e.innerHTML=n.map(e=>{let t=u(e.nombre),n=u(e.descripcion),r=m(e);return`
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
              <strong class="pizza-precio-3d hide">${d(e.precio)}</strong>
              <span class="pizza-hint hide">👆 Ver detalles</span>
            </div>
          </div>

          <div class="pizza-face pizza-face-2">
            <div class="pizza-face-top">
              <h3 class="pizza-nombre-back hide">${t}</h3>
              <p class="pizza-desc-back hide">${n}</p>
            </div>
            <div class="pizza-face-bottom">
              <strong class="pizza-precio-back hide">${d(e.precio)}</strong>
              ${r?`<button type="button" class="btn-add-3d hide" data-add="${e.id}">🛒 Agregar al carrito</button>`:`<span class="btn-add-3d btn-add-3d-disabled hide">Sin stock</span>`}
            </div>
          </div>

          <div class="pizza-img-wrapper">
            <div class="pizza-img-float">
              ${h(e)}
            </div>
          </div>
        </article>
      `}).join(``)}function j(){let e=document.querySelector(`#menu-search`),t=document.querySelector(`#clear-menu-search`),n=document.querySelector(`#menu-categories`),r=document.querySelector(`#available-only`),i=document.querySelector(`#menu-sort`);e?.addEventListener(`input`,()=>{s=e.value.trim(),t&&(t.hidden=!s),A()}),t?.addEventListener(`click`,()=>{e&&(e.value=``,e.focus()),s=``,t.hidden=!0,A()}),n?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-category]`);t&&(o=t.dataset.category,O(),A())}),r?.addEventListener(`change`,()=>{c=r.checked,A()}),i?.addEventListener(`change`,()=>{l=i.value,A()})}async function M(){try{let e=await fetch(r);if(!e.ok)throw Error(`API no disponible`);let t=await e.json();if(!Array.isArray(t))throw Error(`Respuesta inválida del servidor`);return t}catch{let e=await fetch(`./menu.json`);if(!e.ok)throw Error(`No se pudo cargar el menú`);return e.json()}}async function N(){let e=document.querySelector(`#pizzas-cliente`);if(e)try{if(a=await M(),a.length===0){e.innerHTML=`<div class="menu-empty"><p>No hay pizzas disponibles.</p></div>`;return}O(),A(),j()}catch(t){console.error(t),e.innerHTML=`
      <div class="menu-error" role="alert">
        <p>No pudimos conectar con el servidor.</p>
        <p class="menu-error-hint">Arranca el backend: docker compose up -d</p>
        <button type="button" class="btn btn-secondary" id="btn-reintentar-menu">Reintentar</button>
      </div>
    `,e.querySelector(`#btn-reintentar-menu`)?.addEventListener(`click`,()=>{location.reload()})}}D(),E(),N();
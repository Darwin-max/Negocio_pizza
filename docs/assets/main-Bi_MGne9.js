import{t as e}from"./api-B-s7tTxe.js";var t=`573122759195`;function n(e){return`https://wa.me/${t}?text=${encodeURIComponent(e)}`}var r=e(`/api/pizzas`),i=e(`/api/pedidos`),a=[],o=[],s=`todo`,c=``,l=!1,u=`featured`,d=null,f=!1,p=``;function m(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}function h(e){return`$${Number(e).toLocaleString(`es-CO`)}`}function g(e){return String(e).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).toLowerCase()}function _(e){let t=String(e.categoria||e.category||``).trim();if(t&&g(t)!==`pizzas`)return t;let n=g(e.nombre);return/margarita|pepperoni|hawaiana/.test(n)?`Pizzas clásicas`:/pizza|quesos|bbq|pollo/.test(n)?`Pizzas especiales`:t||`Pizzas`}function v(e){return g(_(e)).includes(`combo`)}function y(e){return e.disponible===!0||e.disponible===`t`||Number(e.stock)>0}function b(e){let t=m(e.nombre);if(!e.imagen_url){let t=g(_(e));return`<div class="pizza-placeholder" aria-hidden="true">${t.includes(`bebida`)||t.includes(`granizado`)?`🥤`:t.includes(`hamburguesa`)?`🍔`:t.includes(`acompanamiento`)?`🍟`:t.includes(`postre`)?`🍰`:t.includes(`combo`)?`🥡`:`🍕`}</div>`}return`<img src="${m(e.imagen_url)}" alt="${t}" loading="lazy" decoding="async" width="480" height="360" />`}function x(){return a.reduce((e,t)=>e+t.cantidad,0)}function S(){return a.reduce((e,t)=>e+Number(t.precio)*t.cantidad,0)}function C(){return JSON.stringify([...a].sort((e,t)=>e.pizza_id-t.pizza_id).map(e=>[e.pizza_id,e.cantidad]))}function w(e){let t=a.map(e=>`- ${e.cantidad} x ${e.nombre}: ${h(Number(e.precio)*e.cantidad)}`).join(`
`);return`${e?`Hola, El Callejón. Registré el pedido #${e} en la web.`:`Hola, El Callejón. Quiero hacer este pedido:`}\n\n${t}\n\nTotal: ${h(S())}`}function T(){let e=document.querySelector(`#carrito-count`),t=document.querySelector(`#carrito-total`),r=document.querySelector(`#btn-whatsapp-pedido`),i=document.querySelector(`#btn-registrar-pedido`),o=document.querySelector(`#carrito-estado`),s=C();if(d&&d.firma!==s){let e=d.id;d=null,p=`El carrito cambió. Si registras de nuevo se creará otro pedido; el pedido #${e} seguirá pendiente hasta que lo cancelen en el panel.`}if(a.length===0&&(d=null,p=``),e&&(e.textContent=String(x())),t&&(t.textContent=h(S())),r&&a.length>0){let e=d?.id||null;r.href=n(w(e)),r.textContent=e?`Enviar pedido #${e} solo por WhatsApp`:`Enviar solo por WhatsApp`}i&&(i.disabled=f||a.length===0,i.textContent=f?`Registrando pedido...`:`Registrar pedido y enviar`),o&&(o.textContent=p)}async function E(){if(a.length===0||f)return;let e=C();if(d?.firma===e){p=`El pedido #${d.id} ya está registrado. Abriendo WhatsApp...`,T(),window.location.assign(n(w(d.id)));return}f=!0,p=`Registrando tu pedido en el panel...`,T();try{let t=document.querySelector(`#cliente-telefono`)?.value.trim()||null,r=await fetch(i,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({pizzas:a.map(e=>({pizza_id:e.pizza_id,cantidad:e.cantidad})),telefono_whatsapp:t,notas:`Pedido creado desde el catálogo web`})}),o=await r.json().catch(()=>({}));if(!r.ok)throw Error(o.error||`No se pudo registrar el pedido`);let s=o.pedido||o;if(!s?.id)throw Error(`El servidor no devolvió el número de pedido`);d={id:s.id,firma:e},p=`Pedido #${s.id} registrado. Abriendo WhatsApp...`,T(),window.location.assign(n(w(s.id)))}catch(e){p=`${e.message}. Puedes usar “Enviar solo por WhatsApp”; en ese caso no quedará registrado en el panel.`}finally{f=!1,T()}}function D(){let e=document.querySelector(`#carrito-lista`),t=document.querySelector(`#carrito-vacio`),n=document.querySelector(`#carrito-acciones`);if(e){if(a.length===0){e.innerHTML=``,t&&(t.hidden=!1),n&&(n.hidden=!0),T();return}t&&(t.hidden=!0),n&&(n.hidden=!1),e.innerHTML=a.map(e=>`
        <article class="carrito-item">
          <div>
            <h4>${m(e.nombre)}</h4>
            <p>${h(e.precio)} c/u</p>
          </div>
          <div class="carrito-item-actions">
            <button type="button" data-action="menos" data-id="${e.pizza_id}" aria-label="Reducir cantidad">−</button>
            <span>${e.cantidad}</span>
            <button type="button" data-action="mas" data-id="${e.pizza_id}" aria-label="Aumentar cantidad">+</button>
            <button type="button" class="quitar" data-action="quitar" data-id="${e.pizza_id}">Quitar</button>
          </div>
        </article>
      `).join(``),T()}}function O(e){let t=o.find(t=>t.id===e);if(!t||!y(t))return;let n=a.find(t=>t.pizza_id===e);n?n.cantidad+=1:a.push({pizza_id:t.id,nombre:t.nombre,precio:t.precio,cantidad:1}),D(),j()}function k(e,t){let n=a.find(t=>t.pizza_id===e);if(n){if(n.cantidad+=t,n.cantidad<=0){let t=a.findIndex(t=>t.pizza_id===e);a.splice(t,1)}D()}}function A(e){let t=a.findIndex(t=>t.pizza_id===e);t!==-1&&(a.splice(t,1),D())}function j(){let e=document.querySelector(`#carrito-panel`),t=document.querySelector(`#carrito-fondo`);e?.classList.add(`abierto`),t?.classList.add(`visible`),e?.setAttribute(`aria-hidden`,`false`),document.body.classList.add(`carrito-abierto`)}function M(){let e=document.querySelector(`#carrito-panel`),t=document.querySelector(`#carrito-fondo`);e?.classList.remove(`abierto`),t?.classList.remove(`visible`),e?.setAttribute(`aria-hidden`,`true`),document.body.classList.remove(`carrito-abierto`)}function N(e,t){let n=t??!e.classList.contains(`is-flipped`);document.querySelectorAll(`.pizza-card-3d.is-flipped`).forEach(t=>{t!==e&&t.classList.remove(`is-flipped`)}),e.classList.toggle(`is-flipped`,n)}function P(){let e=document.querySelector(`#social-panel`);e&&(e.hidden=!0,e.setAttribute(`aria-hidden`,`true`),document.querySelectorAll(`.pizza-card-3d button[data-share-pizza][aria-expanded="true"]`).forEach(e=>e.setAttribute(`aria-expanded`,`false`)))}function F(){document.querySelector(`#btn-abrir-carrito`)?.addEventListener(`click`,j),document.querySelector(`#btn-abrir-carrito-flotante`)?.addEventListener(`click`,j),document.querySelector(`#btn-abrir-carrito-contacto`)?.addEventListener(`click`,j),document.querySelector(`#btn-cerrar-carrito`)?.addEventListener(`click`,M),document.querySelector(`#carrito-fondo`)?.addEventListener(`click`,M),document.querySelector(`#social-panel-close`)?.addEventListener(`click`,P),document.querySelector(`#btn-registrar-pedido`)?.addEventListener(`click`,E),document.querySelector(`#carrito-lista`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let n=Number(t.dataset.id),r=t.dataset.action;r===`mas`&&k(n,1),r===`menos`&&k(n,-1),r===`quitar`&&A(n)}),[`#pizzas-cliente`,`#combos-cliente`].forEach(e=>{let t=document.querySelector(e);t?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-add]`);if(t){e.stopPropagation(),O(Number(t.dataset.add));return}let n=e.target.closest(`button[data-share-pizza]`);if(n){e.stopPropagation();let t=document.querySelector(`#social-panel`);t&&(document.querySelectorAll(`.pizza-card-3d button[data-share-pizza][aria-expanded="true"]`).forEach(e=>e.setAttribute(`aria-expanded`,`false`)),t.hidden=!1,t.setAttribute(`aria-hidden`,`false`),n.setAttribute(`aria-expanded`,`true`),t.querySelector(`#social-panel-close`)?.focus());return}if(e.target.closest(`a[data-card-whatsapp]`)){e.stopPropagation();return}let r=e.target.closest(`.pizza-card-3d`);r&&N(r)}),t?.addEventListener(`keydown`,e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(`.pizza-card-3d`);!t||e.target!==t&&e.target.closest(`button, a`)||(e.preventDefault(),N(t))})}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&(M(),P())}),D()}function I(){let e=document.querySelector(`#nav-toggle`),t=document.querySelector(`#site-nav`),r=document.querySelector(`.site-header`);document.querySelectorAll(`[data-whatsapp-link]`).forEach(e=>{e.href=n(`Hola, quisiera información sobre el menú de El Callejón.`)}),e?.addEventListener(`click`,()=>{let n=t?.classList.toggle(`abierto`);e.setAttribute(`aria-expanded`,n?`true`:`false`)}),t?.querySelectorAll(`a`).forEach(n=>{n.addEventListener(`click`,()=>{t.classList.remove(`abierto`),e?.setAttribute(`aria-expanded`,`false`)})}),window.addEventListener(`scroll`,()=>{r?.classList.toggle(`scrolled`,window.scrollY>8)},{passive:!0})}function L(){let e=document.querySelector(`#menu-categories`);if(!e)return;let t=o.filter(e=>!v(e)),n=[...new Set(t.map(_))];e.innerHTML=[{id:`todo`,nombre:`Todo`,cantidad:t.length},...n.map(e=>({id:g(e),nombre:e,cantidad:t.filter(t=>_(t)===e).length}))].map(e=>`
        <button type="button" class="menu-category${s===e.id?` activo`:``}"
          data-category="${m(e.id)}" aria-pressed="${s===e.id}">
          <span>${m(e.nombre)}</span>
          <span class="category-count">${e.cantidad}</span>
        </button>
      `).join(``)}function R(){let e=o.filter(e=>{if(v(e))return!1;let t=_(e),n=s===`todo`||g(t)===s,r=g(`${e.nombre} ${e.descripcion||``}`).includes(g(c)),i=!l||y(e);return n&&r&&i});return u===`price-asc`?e=e.sort((e,t)=>Number(e.precio)-Number(t.precio)):u===`price-desc`?e=e.sort((e,t)=>Number(t.precio)-Number(e.precio)):u===`name`&&(e=e.sort((e,t)=>e.nombre.localeCompare(t.nombre,`es`))),e}function z(){let e=document.querySelector(`#pizzas-cliente`),t=document.querySelector(`#menu-results-count`);if(!e)return;let n=R(),r=o.filter(e=>!v(e)).length;if(t&&(t.textContent=`Mostrando ${n.length} de ${r} ${r===1?`producto`:`productos`}`),n.length===0){e.innerHTML=`
      <div class="menu-empty" role="status">
        <p>No encontramos productos con esos filtros.</p>
        <button type="button" class="btn btn-secondary" id="clear-menu-filters">Limpiar filtros</button>
      </div>
    `,e.querySelector(`#clear-menu-filters`)?.addEventListener(`click`,()=>{s=`todo`,c=``,l=!1,u=`featured`;let e=document.querySelector(`#menu-search`),t=document.querySelector(`#available-only`),n=document.querySelector(`#menu-sort`);e&&(e.value=``),t&&(t.checked=!1),n&&(n.value=`featured`);let r=document.querySelector(`#clear-menu-search`);r&&(r.hidden=!0),L(),z()});return}e.innerHTML=V(n)}function B(){let e=document.querySelector(`#combos`),t=document.querySelector(`#combos-cliente`);if(!e||!t)return;let n=o.filter(v);e.hidden=n.length===0,t.innerHTML=V(n)}function V(e){return e.map(e=>{let t=m(e.nombre),r=m(e.descripcion),i=y(e),a=_(e),o=`<div class="pizza-img-wrapper">${b(e)}</div>`,s=n(`Hola, El Callejón. Quiero pedir ${e.nombre} (${a}) por ${h(e.precio)}.`);return`
        <article class="pizza-card-3d ${i?``:`pizza-card-agotada`}"
          data-flip
          role="group"
          tabindex="0"
          aria-label="${t}, categoría ${m(a)}. Pulsa para ver detalles"
        >
          <div class="pizza-face pizza-face-1">
            <div class="pizza-face-top">
              <span class="pizza-badge-3d ${i?`disponible`:`agotada`}">
                ${i?`✓ Disponible`:`✗ Agotada`}
              </span>
              <span class="pizza-badge-3d">${m(a)}</span>
              <h3 class="pizza-nombre-3d hide">${t}</h3>
              <p class="pizza-desc-3d hide">${r}</p>
            </div>
            ${o}
            <div class="pizza-face-bottom">
              <strong class="pizza-precio-3d hide">${h(e.precio)}</strong>
              <span class="pizza-hint hide">👆 Ver detalles</span>
            </div>
          </div>

          <div class="pizza-face pizza-face-2">
            <div class="pizza-face-top">
              <h3 class="pizza-nombre-back hide">${t}</h3>
              <p class="pizza-desc-back hide">${r}</p>
            </div>
            ${o}
            <div class="pizza-face-bottom">
              <strong class="pizza-precio-back hide">${h(e.precio)}</strong>
              <div class="pizza-actions hide">
                <a class="pizza-whatsapp" data-card-whatsapp href="${m(s)}" target="_blank" rel="noopener noreferrer" aria-label="Pedir ${t} por WhatsApp">
                  <svg class="whatsapp-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                    <path d="M20.4 11.7a8.3 8.3 0 0 1-12.3 7.2L3.8 20l1.1-4.2a8.3 8.3 0 1 1 15.5-4.1Z" />
                    <path d="M9 8.7c.2-.4.4-.4.7-.4h.5l.9 2.1-1 .9c.6 1.2 1.5 2.1 2.8 2.8l.8-1 2.1.9v.5c0 .3-.1.6-.4.7-.8.4-1.7.4-2.6.1-2.2-.8-4.2-2.7-5-5-.3-.9-.2-1.8.2-2.6Z" />
                  </svg>
                </a>
                ${i?`<button type="button" class="btn-add-3d" data-add="${e.id}"><span aria-hidden="true">+</span> Añadir</button>`:`<span class="btn-add-3d btn-add-3d-disabled">Sin stock</span>`}
                <button type="button" class="pizza-share" data-share-pizza aria-label="Ver redes sociales" aria-controls="social-panel" aria-expanded="false">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="m8.7 10.6 6.6-4.2M8.7 13.4l6.6 4.2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      `}).join(``)}function H(){let e=document.querySelector(`#menu-search`),t=document.querySelector(`#clear-menu-search`),n=document.querySelector(`#menu-categories`),r=document.querySelector(`#available-only`),i=document.querySelector(`#menu-sort`);e?.addEventListener(`input`,()=>{c=e.value.trim(),t&&(t.hidden=!c),z()}),t?.addEventListener(`click`,()=>{e&&(e.value=``,e.focus()),c=``,t.hidden=!0,z()}),n?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-category]`);t&&(s=t.dataset.category,L(),z())}),r?.addEventListener(`change`,()=>{l=r.checked,z()}),i?.addEventListener(`change`,()=>{u=i.value,z()})}async function U(){try{let e=await fetch(r);if(!e.ok)throw Error(`API no disponible`);let t=await e.json();if(!Array.isArray(t))throw Error(`Respuesta inválida del servidor`);return t}catch{let e=await fetch(`./menu.json`);if(!e.ok)throw Error(`No se pudo cargar el menú`);return e.json()}}async function W(){let e=document.querySelector(`#pizzas-cliente`);if(e)try{if(o=await U(),o.length===0){e.innerHTML=`<div class="menu-empty"><p>No hay productos disponibles.</p></div>`;return}L(),B(),z(),H()}catch(t){console.error(t),e.innerHTML=`
      <div class="menu-error" role="alert">
        <p>No pudimos conectar con el servidor.</p>
        <p class="menu-error-hint">Arranca el backend: docker compose up -d</p>
        <button type="button" class="btn btn-secondary" id="btn-reintentar-menu">Reintentar</button>
      </div>
    `,e.querySelector(`#btn-reintentar-menu`)?.addEventListener(`click`,()=>{location.reload()})}}I(),F(),W();
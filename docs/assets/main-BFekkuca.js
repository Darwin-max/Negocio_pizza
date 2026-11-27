import{n as e,t}from"./api-CJ2HZa6b.js";var n=`573122759195`;function r(e){return`https://wa.me/${n}?text=${encodeURIComponent(e)}`}var i=t(`/api/pizzas`),a=t(`/api/pedidos`),o=[],s=[],c=`todo`,l=``,u=!1,d=`featured`,f=null,p=!1,m=``,h=null;function g(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}function _(e){return`$${Number(e).toLocaleString(`es-CO`)}`}function v(e){return String(e).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).toLowerCase()}function y(e){let t=String(e.categoria||e.category||``).trim();if(t&&v(t)!==`pizzas`)return t;let n=v(e.nombre);return/margarita|pepperoni|hawaiana/.test(n)?`Pizzas clásicas`:/pizza|quesos|bbq|pollo/.test(n)?`Pizzas especiales`:t||`Pizzas`}function b(e){return v(y(e)).includes(`combo`)}function x(e){return e.disponible===!0||e.disponible===`t`||Number(e.stock)>0}function S(t){let n=g(t.nombre),r=e(t.imagen_url);if(!r){let e=v(y(t));return`<div class="pizza-placeholder" aria-hidden="true">${e.includes(`bebida`)||e.includes(`granizado`)?`🥤`:e.includes(`hamburguesa`)?`🍔`:e.includes(`acompanamiento`)?`🍟`:e.includes(`postre`)?`🍰`:e.includes(`combo`)?`🥡`:`🍕`}</div>`}return`<img src="${g(r)}" alt="${n}" loading="lazy" decoding="async" width="480" height="360" />`}async function C(){let n=document.querySelector(`#logo-negocio`);if(!n)return;let r=n.getAttribute(`data-logo-fallback`)||`./el-callejon-logo.png`;try{let i=await fetch(t(`/api/configuracion/negocio`));if(!i.ok)return;let a=await i.json();if(!a?.logo_url)return;n.addEventListener(`error`,()=>{n.src=r},{once:!0}),n.src=e(a.logo_url)}catch{}}function w(){return o.reduce((e,t)=>e+t.cantidad,0)}function T(){return o.reduce((e,t)=>e+Number(t.precio)*t.cantidad,0)}function E(){return JSON.stringify([...o].sort((e,t)=>e.pizza_id-t.pizza_id).map(e=>[e.pizza_id,e.cantidad]))}function D(e){let t=o.map(e=>`- ${e.cantidad} x ${e.nombre}: ${_(Number(e.precio)*e.cantidad)}`).join(`
`);return`${e?`Hola, El Callejón. Registré el pedido #${e} en la web.`:`Hola, El Callejón. Quiero hacer este pedido:`}\n\n${t}\n\nTotal: ${_(T())}`}function O(){let e=document.querySelector(`#carrito-total`),t=document.querySelector(`#btn-whatsapp-pedido`),n=document.querySelector(`#btn-registrar-pedido`),i=document.querySelector(`#carrito-estado`),a=E(),s=w();if(f&&f.firma!==a){let e=f.id;f=null,m=`El carrito cambió. Si registras de nuevo se creará otro pedido; el pedido #${e} seguirá pendiente hasta que lo cancelen en el panel.`}o.length===0&&(f=null,m=``),document.querySelectorAll(`[data-cart-count]`).forEach(e=>{e.textContent=s>99?`99+`:String(s)}),document.querySelectorAll(`#btn-abrir-carrito-header, #btn-abrir-carrito-flotante`).forEach(e=>{e.setAttribute(`aria-label`,s===0?`Ver mi pedido, vacío`:`Ver mi pedido, ${s} ${s===1?`producto`:`productos`}`)});let c=document.querySelector(`#carrito-subtitulo`);if(c&&(c.textContent=s===0?`Aún no has agregado productos`:`${s} ${s===1?`producto`:`productos`} en tu pedido`),e&&(e.textContent=_(T())),t&&o.length>0){let e=f?.id||null;t.href=r(D(e)),t.textContent=e?`Enviar pedido #${e} solo por WhatsApp`:`Enviar solo por WhatsApp`}n&&(n.disabled=p||o.length===0,n.textContent=p?`Registrando pedido...`:`Registrar pedido y enviar`),i&&(i.textContent=m)}async function k(){if(o.length===0||p)return;let e=E();if(f?.firma===e){m=`El pedido #${f.id} ya está registrado. Abriendo WhatsApp...`,O(),window.location.assign(r(D(f.id)));return}p=!0,m=`Registrando tu pedido en el panel...`,O();try{let t=document.querySelector(`#cliente-telefono`)?.value.trim()||null,n=await fetch(a,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({pizzas:o.map(e=>({pizza_id:e.pizza_id,cantidad:e.cantidad})),telefono_whatsapp:t,notas:`Pedido creado desde el catálogo web`})}),i=await n.json().catch(()=>({}));if(!n.ok)throw Error(i.error||`No se pudo registrar el pedido`);let s=i.pedido||i;if(!s?.id)throw Error(`El servidor no devolvió el número de pedido`);f={id:s.id,firma:e},m=`Pedido #${s.id} registrado. Abriendo WhatsApp...`,O(),window.location.assign(r(D(s.id)))}catch(e){m=`${e.message}. Puedes usar “Enviar solo por WhatsApp”; en ese caso no quedará registrado en el panel.`}finally{p=!1,O()}}function A(){let e=document.querySelector(`#carrito-lista`),t=document.querySelector(`#carrito-vacio`),n=document.querySelector(`#carrito-acciones`);if(e){if(o.length===0){e.innerHTML=``,t&&(t.hidden=!1),n&&(n.hidden=!0),O();return}t&&(t.hidden=!0),n&&(n.hidden=!1),e.innerHTML=o.map(e=>`
        <article class="carrito-item">
          <div>
            <h4>${g(e.nombre)}</h4>
            <p>${_(e.precio)} c/u</p>
          </div>
          <div class="carrito-item-actions">
            <button type="button" data-action="menos" data-id="${e.pizza_id}" aria-label="Reducir cantidad">−</button>
            <span>${e.cantidad}</span>
            <button type="button" data-action="mas" data-id="${e.pizza_id}" aria-label="Aumentar cantidad">+</button>
            <button type="button" class="quitar" data-action="quitar" data-id="${e.pizza_id}">Quitar</button>
          </div>
        </article>
      `).join(``),O()}}function j(e){let t=s.find(t=>t.id===e);if(!t||!x(t))return;let n=o.find(t=>t.pizza_id===e);n?n.cantidad+=1:o.push({pizza_id:t.id,nombre:t.nombre,precio:t.precio,cantidad:1}),A(),P()}function M(e,t){let n=o.find(t=>t.pizza_id===e);if(n){if(n.cantidad+=t,n.cantidad<=0){let t=o.findIndex(t=>t.pizza_id===e);o.splice(t,1)}A()}}function N(e){let t=o.findIndex(t=>t.pizza_id===e);t!==-1&&(o.splice(t,1),A())}function P(){let e=document.querySelector(`#carrito-panel`),t=document.querySelector(`#carrito-fondo`);!e?.classList.contains(`abierto`)&&document.activeElement instanceof HTMLElement&&(h=document.activeElement),e?.classList.add(`abierto`),t?.classList.add(`visible`),e?.setAttribute(`aria-hidden`,`false`),document.body.classList.add(`carrito-abierto`),document.querySelector(`#btn-cerrar-carrito`)?.focus({preventScroll:!0})}function F(){I(),document.querySelector(`#menu`)?.scrollIntoView({behavior:`smooth`}),window.setTimeout(()=>{document.querySelector(`#menu-search`)?.focus({preventScroll:!0})},350)}function I(){let e=document.querySelector(`#carrito-panel`),t=document.querySelector(`#carrito-fondo`),n=e?.classList.contains(`abierto`);e?.classList.remove(`abierto`),t?.classList.remove(`visible`),e?.setAttribute(`aria-hidden`,`true`),document.body.classList.remove(`carrito-abierto`),n&&e?.contains(document.activeElement)&&h&&h.focus({preventScroll:!0}),n&&(h=null)}function L(e,t){let n=t??!e.classList.contains(`is-flipped`);document.querySelectorAll(`.pizza-card-3d.is-flipped`).forEach(t=>{t!==e&&t.classList.remove(`is-flipped`)}),e.classList.toggle(`is-flipped`,n)}function R(){let e=document.querySelector(`#social-panel`);e&&(e.hidden=!0,e.setAttribute(`aria-hidden`,`true`),document.querySelectorAll(`.pizza-card-3d button[data-share-pizza][aria-expanded="true"]`).forEach(e=>e.setAttribute(`aria-expanded`,`false`)))}function z(){document.querySelector(`#btn-abrir-carrito`)?.addEventListener(`click`,P),document.querySelector(`#btn-abrir-carrito-header`)?.addEventListener(`click`,P),document.querySelector(`#btn-abrir-carrito-flotante`)?.addEventListener(`click`,P),document.querySelector(`#btn-abrir-carrito-contacto`)?.addEventListener(`click`,P),document.querySelector(`#btn-carrito-ir-menu`)?.addEventListener(`click`,F),document.querySelector(`#btn-cerrar-carrito`)?.addEventListener(`click`,I),document.querySelector(`#carrito-fondo`)?.addEventListener(`click`,I),document.querySelector(`#social-panel-close`)?.addEventListener(`click`,R),document.querySelector(`#btn-registrar-pedido`)?.addEventListener(`click`,k),document.querySelector(`#carrito-lista`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let n=Number(t.dataset.id),r=t.dataset.action;r===`mas`&&M(n,1),r===`menos`&&M(n,-1),r===`quitar`&&N(n)}),[`#pizzas-cliente`,`#combos-cliente`].forEach(e=>{let t=document.querySelector(e);t?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-add]`);if(t){e.stopPropagation(),j(Number(t.dataset.add));return}let n=e.target.closest(`button[data-share-pizza]`);if(n){e.stopPropagation();let t=document.querySelector(`#social-panel`);t&&(document.querySelectorAll(`.pizza-card-3d button[data-share-pizza][aria-expanded="true"]`).forEach(e=>e.setAttribute(`aria-expanded`,`false`)),t.hidden=!1,t.setAttribute(`aria-hidden`,`false`),n.setAttribute(`aria-expanded`,`true`),t.querySelector(`#social-panel-close`)?.focus());return}if(e.target.closest(`a[data-card-whatsapp]`)){e.stopPropagation();return}let r=e.target.closest(`.pizza-card-3d`);r&&L(r)}),t?.addEventListener(`keydown`,e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(`.pizza-card-3d`);!t||e.target!==t&&e.target.closest(`button, a`)||(e.preventDefault(),L(t))})}),document.addEventListener(`keydown`,e=>{if(e.key===`Escape`){I(),R();return}if(e.key!==`Tab`)return;let t=document.querySelector(`#carrito-panel`);if(!t?.classList.contains(`abierto`))return;let n=[...t.querySelectorAll(`a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`)].filter(e=>e.getClientRects().length>0);if(n.length===0)return;let r=n[0],i=n[n.length-1];if(!t.contains(document.activeElement)){e.preventDefault(),r.focus();return}e.shiftKey&&document.activeElement===r?(e.preventDefault(),i.focus()):!e.shiftKey&&document.activeElement===i&&(e.preventDefault(),r.focus())}),A()}function B(){let e=document.querySelector(`#nav-toggle`),t=document.querySelector(`#site-nav`),n=document.querySelector(`.site-header`);document.querySelectorAll(`[data-whatsapp-link]`).forEach(e=>{e.href=r(`Hola, quisiera información sobre el menú de El Callejón.`)}),e?.addEventListener(`click`,()=>{let n=t?.classList.toggle(`abierto`);e.setAttribute(`aria-expanded`,n?`true`:`false`)}),t?.querySelectorAll(`a`).forEach(n=>{n.addEventListener(`click`,()=>{t.classList.remove(`abierto`),e?.setAttribute(`aria-expanded`,`false`)})}),window.addEventListener(`scroll`,()=>{n?.classList.toggle(`scrolled`,window.scrollY>8)},{passive:!0})}var V={featured:`Recomendados`,"price-asc":`Menor precio`,"price-desc":`Mayor precio`,name:`Nombre A-Z`};function H(){return c!==`todo`||!!l||u||d!==`featured`}function U(){let e=document.querySelector(`#filter-summary-hint`),t=document.querySelector(`#menu-clear-filters`),n=[];if(c!==`todo`){let e=document.querySelector(`#menu-categories .menu-category.activo span`)?.textContent?.trim();e&&n.push(e)}n.push(V[d]||`Recomendados`),u&&n.push(`Solo disponibles`),e&&(e.textContent=n.join(` · `)),t&&(t.hidden=!H())}function W(){c=`todo`,l=``,u=!1,d=`featured`;let e=document.querySelector(`#menu-search`),t=document.querySelector(`#available-only`),n=document.querySelector(`#menu-sort`),r=document.querySelector(`#clear-menu-search`);e&&(e.value=``),t&&(t.checked=!1),n&&(n.value=`featured`),r&&(r.hidden=!0),document.querySelector(`.catalog-filter`)?.removeAttribute(`open`),G(),q()}function G(){let e=document.querySelector(`#menu-categories`);if(!e)return;let t=s.filter(e=>!b(e)),n=[...new Set(t.map(y))];e.innerHTML=[{id:`todo`,nombre:`Todo`,cantidad:t.length},...n.map(e=>({id:v(e),nombre:e,cantidad:t.filter(t=>y(t)===e).length}))].map(e=>`
        <button type="button" class="menu-category${c===e.id?` activo`:``}"
          data-category="${g(e.id)}" aria-pressed="${c===e.id}">
          <span>${g(e.nombre)}</span>
          <span class="category-count">${e.cantidad}</span>
        </button>
      `).join(``)}function K(){let e=s.filter(e=>{if(b(e))return!1;let t=y(e),n=c===`todo`||v(t)===c,r=v(`${e.nombre} ${e.descripcion||``}`).includes(v(l)),i=!u||x(e);return n&&r&&i});return d===`price-asc`?e=e.sort((e,t)=>Number(e.precio)-Number(t.precio)):d===`price-desc`?e=e.sort((e,t)=>Number(t.precio)-Number(e.precio)):d===`name`&&(e=e.sort((e,t)=>e.nombre.localeCompare(t.nombre,`es`))),e}function q(){let e=document.querySelector(`#pizzas-cliente`),t=document.querySelector(`#menu-results-count`);if(!e)return;let n=K(),r=s.filter(e=>!b(e)).length;if(t&&(t.textContent=`Mostrando ${n.length} de ${r} ${r===1?`producto`:`productos`}`),U(),n.length===0){e.innerHTML=`
      <div class="menu-empty" role="status">
        <span class="menu-empty-icon" aria-hidden="true">🔎</span>
        <h3>No encontramos coincidencias</h3>
        <p>Prueba con otro nombre o limpia los filtros para volver a ver todo el menú.</p>
        <button type="button" class="btn btn-secondary" data-clear-filters>Ver todo el menú</button>
      </div>
    `,e.querySelector(`[data-clear-filters]`)?.addEventListener(`click`,W);return}e.innerHTML=Y(n)}function J(){let e=document.querySelector(`#combos`),t=document.querySelector(`#combos-cliente`);if(!e||!t)return;let n=s.filter(b);e.hidden=n.length===0,t.innerHTML=Y(n)}function Y(e){return e.map(e=>{let t=g(e.nombre),n=g(e.descripcion),i=x(e),a=y(e),o=`<div class="pizza-img-wrapper">${S(e)}</div>`,s=r(`Hola, El Callejón. Quiero pedir ${e.nombre} (${a}) por ${_(e.precio)}.`);return`
        <article class="pizza-card-3d ${i?``:`pizza-card-agotada`}"
          data-flip
          role="group"
          tabindex="0"
          aria-label="${t}, categoría ${g(a)}. Pulsa para ver detalles"
        >
          <div class="pizza-face pizza-face-1">
            <div class="pizza-face-top">
              <span class="pizza-badge-3d ${i?`disponible`:`agotada`}">
                ${i?`✓ Disponible`:`✗ Agotada`}
              </span>
              <span class="pizza-badge-3d">${g(a)}</span>
              <h3 class="pizza-nombre-3d hide">${t}</h3>
              <p class="pizza-desc-3d hide">${n}</p>
            </div>
            ${o}
            <div class="pizza-face-bottom">
              <strong class="pizza-precio-3d hide">${_(e.precio)}</strong>
              <span class="pizza-hint hide">👆 Ver detalles</span>
            </div>
          </div>

          <div class="pizza-face pizza-face-2">
            <div class="pizza-face-top">
              <h3 class="pizza-nombre-back hide">${t}</h3>
              <p class="pizza-desc-back hide">${n}</p>
            </div>
            ${o}
            <div class="pizza-face-bottom">
              <strong class="pizza-precio-back hide">${_(e.precio)}</strong>
              <div class="pizza-actions hide">
                <a class="pizza-whatsapp" data-card-whatsapp href="${g(s)}" target="_blank" rel="noopener noreferrer" aria-label="Pedir ${t} por WhatsApp">
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
      `}).join(``)}function X(){let e=document.querySelector(`#menu-search`),t=document.querySelector(`#clear-menu-search`),n=document.querySelector(`#menu-categories`),r=document.querySelector(`#available-only`),i=document.querySelector(`#menu-sort`),a=document.querySelector(`#menu-clear-filters`),o=document.querySelector(`.catalog-filter`);e?.addEventListener(`input`,()=>{l=e.value.trim(),t&&(t.hidden=!l),q()}),t?.addEventListener(`click`,()=>{e&&(e.value=``,e.focus()),l=``,t.hidden=!0,q()}),n?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-category]`);t&&(c=t.dataset.category,G(),q())}),r?.addEventListener(`change`,()=>{u=r.checked,q()}),i?.addEventListener(`change`,()=>{d=i.value,q()}),a?.addEventListener(`click`,W),document.addEventListener(`click`,e=>{o?.open&&(o.contains(e.target)||(o.open=!1))}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&o?.open&&(o.open=!1)}),U()}async function Z(){try{let e=await fetch(i);if(!e.ok)throw Error(`API no disponible`);let t=await e.json();if(!Array.isArray(t))throw Error(`Respuesta inválida del servidor`);return t}catch{let e=await fetch(`./menu.json`);if(!e.ok)throw Error(`No se pudo cargar el menú`);return e.json()}}async function Q(){let e=document.querySelector(`#pizzas-cliente`);if(e)try{if(s=await Z(),s.length===0){e.innerHTML=`
        <div class="menu-empty" role="status">
          <span class="menu-empty-icon" aria-hidden="true">🍕</span>
          <h3>Estamos actualizando el menú</h3>
          <p>Por ahora no hay productos publicados. Escríbenos por WhatsApp y con gusto te contamos qué hay disponible.</p>
          <a class="btn btn-whatsapp" href="${g(r(`Hola, quisiera consultar el menú disponible de El Callejón.`))}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
        </div>
      `;return}G(),J(),q(),X()}catch(t){console.error(t),e.innerHTML=`
      <div class="menu-error" role="alert">
        <span class="menu-error-icon" aria-hidden="true">📡</span>
        <h3>No pudimos cargar el menú</h3>
        <p class="menu-error-hint">
          Revisa tu conexión e inténtalo de nuevo. Si el problema continúa,
          escríbenos por WhatsApp y te ayudamos con tu pedido.
        </p>
        <div class="menu-error-actions">
          <button type="button" class="btn btn-secondary" id="btn-reintentar-menu">Reintentar</button>
          <a class="btn btn-whatsapp" href="${g(r(`Hola, no pude cargar el menú en la página. ¿Me ayudan con mi pedido?`))}" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>
        </div>
      </div>
    `,e.querySelector(`#btn-reintentar-menu`)?.addEventListener(`click`,()=>{location.reload()})}}B(),z(),C(),Q();
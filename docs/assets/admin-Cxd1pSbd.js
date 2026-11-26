import{n as e,t}from"./api-CJ2HZa6b.js";var n=t(`/api`),r=`pizza_admin_token`,i={dashboard:{titulo:`Dashboard`,subtitulo:`Resumen de ventas, pedidos y stock de tu negocio.`},pedidos:{titulo:`Pedidos`,subtitulo:`Gestiona pagos, entregas y cancelaciones.`},productos:{titulo:`Productos`,subtitulo:`Administra el catálogo, los precios y el inventario.`},negocio:{titulo:`Negocio`,subtitulo:`Personaliza la imagen y la identidad de tu negocio.`},reportes:{titulo:`Reportes`,subtitulo:`Analiza las ventas y el rendimiento del mes.`}},a={PENDIENTE_PAGO:{label:`Pendiente de pago`,clase:`pendiente`},PAGO_CONFIRMADO:{label:`Pago confirmado`,clase:`pagado`},PAGADO:{label:`Pagado`,clase:`pagado`},FINALIZADO:{label:`Finalizado`,clase:`finalizado`},CANCELADO:{label:`Cancelado`,clase:`cancelado`}},o={dinero:`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c-.6-.6-1.7-1-2.9-1-1.7 0-3 .8-3 2s1.1 1.8 3 2.2 3 1 3 2.3-1.3 2-3 2c-1.2 0-2.3-.4-2.9-1"/></svg>`,bolsa:`<svg viewBox="0 0 24 24" fill="none"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,reloj:`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,alerta:`<svg viewBox="0 0 24 24" fill="none"><path d="m12 3 9 17H3L12 3Z"/><path d="M12 9v5M12 17.5v.1"/></svg>`,agotado:`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>`,check:`<svg viewBox="0 0 24 24" fill="none"><path d="m5 12 4.5 4.5L19 7"/></svg>`,telefono:`<svg viewBox="0 0 24 24" fill="none"><path d="M7 3h3l1.5 4.5-2 1.5a14 14 0 0 0 5.5 5.5l1.5-2L21 14v3a2 2 0 0 1-2 2A16 16 0 0 1 5 5a2 2 0 0 1 2-2Z"/></svg>`,codigo:`<svg viewBox="0 0 24 24" fill="none"><path d="M8 4h8v16H8z"/><path d="M10 8h4M10 12h4M10 16h2"/></svg>`,editar:`<svg viewBox="0 0 24 24" fill="none"><path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="m14 6 4 4"/></svg>`,ojo:`<svg viewBox="0 0 24 24" fill="none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>`,usuario:`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>`,ubicacion:`<svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>`,notas:`<svg viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>`,calendario:`<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>`,estrella:`<svg viewBox="0 0 24 24" fill="none"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>`,tendencia:`<svg viewBox="0 0 24 24" fill="none"><path d="M3 17 9 11l4 4 7-8"/><path d="M15 7h5v5"/></svg>`},s=[],c=[],l=!1,u=!1,d=``,f=`todos`,p=``,m=`todas`,h=null,g=``,_=``,v=null,ee=5242880,te=[`image/jpeg`,`image/png`,`image/webp`,`image/gif`,`image/avif`];function y(){return localStorage.getItem(r)}function ne(e){localStorage.setItem(r,e)}function b(){localStorage.removeItem(r)}function x(e){try{let t=e.split(`.`)[1];if(!t)return!0;let n=t.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(Math.ceil(t.length/4)*4,`=`),r=JSON.parse(atob(n));return!!(r.exp&&r.exp*1e3<=Date.now())}catch{return!0}}function S(){let e=y();return e?!x(e)||(b(),!1):!1}async function C(e,t={}){let r={...t.headers||{}};t.body instanceof FormData||(r[`Content-Type`]=`application/json`);let i=y();i&&(r.Authorization=`Bearer ${i}`);let a=await fetch(`${n}${e}`,{...t,headers:r}),o=await a.json().catch(()=>({}));if(a.status===401)throw y()&&(b(),window.location.reload()),Error(o.error||`Tu sesión expiró. Vuelve a iniciar sesión.`);if(!a.ok)throw Error(o.error||`Error en la solicitud`);return o}function w(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function T(e){return String(e??``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).toLowerCase().trim()}function E(e){let t=Number(e);return`$${(Number.isFinite(t)?t:0).toLocaleString(`es-CO`)}`}function D(e){if(!e)return`—`;let t=new Date(e);return Number.isNaN(t.getTime())?`—`:t.toLocaleString(`es-CO`,{dateStyle:`short`,timeStyle:`short`})}function O(e){if(typeof e==`string`){let t=e.match(/^(\d{4})-(\d{2})-(\d{2})/);if(t)return{anio:Number(t[1]),mes:Number(t[2]),dia:Number(t[3])}}let t=new Date(e);return Number.isNaN(t.getTime())?null:{anio:t.getFullYear(),mes:t.getMonth()+1,dia:t.getDate()}}function k(e){let t=O(e);return t?new Date(t.anio,t.mes-1,t.dia).toLocaleDateString(`es-CO`,{day:`2-digit`,month:`short`,year:`numeric`}):`—`}function A(e){let t=O(e);return t?String(t.dia):`—`}function j(e){return a[e]||{label:e||`Sin estado`,clase:`neutro`}}function M(e){return o[e]||o.bolsa}function N(e){return e?te.includes(e.type)?e.size>ee?`La imagen no puede superar los 5 MB.`:``:`Usa una imagen JPG, PNG, WebP, GIF o AVIF.`:`Selecciona una imagen.`}async function re(e){let t=new FormData;return t.append(`imagen`,e),C(`/imagenes`,{method:`POST`,body:t})}function ie(e){let t=String(e||``).match(/^\/api\/imagenes\/(\d+)$/);return t?Number(t[1]):null}async function P(e){let t=ie(e);if(t)try{await C(`/imagenes/${t}`,{method:`DELETE`})}catch{}}function F(t=``,n=null){let r=document.querySelector(`#imagen-preview`);if(!r)return;_&&=(URL.revokeObjectURL(_),``);let i=``;n?(_=URL.createObjectURL(n),i=_):t&&(i=e(t)),r.innerHTML=i?`<img src="${w(i)}" alt="Vista previa de la imagen del producto" />`:`<div class="imagen-preview-placeholder"><span aria-hidden="true">🍕</span><small>Sin imagen</small></div>`;let a=document.querySelector(`#btn-quitar-imagen`);a&&(a.hidden=!i)}function I(){let t=document.querySelector(`#logo-preview`);if(!t)return;t.innerHTML=`<img src="${w(v?e(v):`./el-callejon-logo.png`)}" alt="Logo actual del negocio" />`;let n=document.querySelector(`#btn-quitar-logo`);n&&(n.hidden=!v)}function L(e,t=`success`){let n=document.querySelector(`#admin-toasts`);if(!n)return;let r=document.createElement(`div`);r.className=`admin-toast ${t}`,r.setAttribute(`role`,t===`error`?`alert`:`status`);let i=document.createElement(`span`);i.className=`toast-dot`,i.setAttribute(`aria-hidden`,`true`);let a=document.createElement(`p`);a.textContent=e;let o=document.createElement(`button`);o.type=`button`,o.setAttribute(`aria-label`,`Cerrar notificación`),o.textContent=`×`,r.append(i,a,o),n.appendChild(r);let s=()=>{r.classList.add(`saliendo`),window.setTimeout(()=>r.remove(),180)};o.addEventListener(`click`,s),window.setTimeout(s,4800)}function R(e){let t=document.getElementById(e);t&&(typeof t.showModal==`function`?t.showModal():t.setAttribute(`open`,``))}function z(e){let t=document.getElementById(e);t&&(typeof t.close==`function`?t.close():t.removeAttribute(`open`))}function B(e){let t=i[e]||i.dashboard;document.querySelectorAll(`.admin-nav-item`).forEach(t=>{let n=t.dataset.section===e;t.classList.toggle(`activo`,n),n?t.setAttribute(`aria-current`,`page`):t.removeAttribute(`aria-current`)}),document.querySelectorAll(`.admin-section`).forEach(t=>{let n=t.id===`section-${e}`;t.hidden=!n,t.classList.toggle(`activo`,n)});let n=document.querySelector(`#admin-page-title`),r=document.querySelector(`#admin-page-subtitle`);n&&(n.textContent=t.titulo),r&&(r.textContent=t.subtitulo),window.scrollTo({top:0,behavior:`smooth`})}async function ae(e){e.preventDefault();let t=document.querySelector(`#login-usuario`).value.trim(),n=document.querySelector(`#login-password`).value,r=document.querySelector(`#login-resultado`),i=e.currentTarget.querySelector(`button[type="submit"]`);r.innerHTML=``;try{i&&(i.disabled=!0,i.textContent=`Ingresando...`),ne((await C(`/auth/login`,{method:`POST`,body:JSON.stringify({usuario:t,password:n})})).token),window.location.reload()}catch(e){r.innerHTML=`<p class="error">${w(e.message)}</p>`}finally{i&&(i.disabled=!1,i.textContent=`Iniciar sesión`)}}function oe(){b(),window.location.reload()}async function V(){let e=document.querySelector(`#dashboard-stats`);if(e)try{let t=await C(`/reportes/dashboard`);e.innerHTML=`
      <article class="stat-card tone-success">
        <div class="stat-top">
          <span class="stat-label">Ventas hoy</span>
          <span class="stat-icon" aria-hidden="true">${M(`dinero`)}</span>
        </div>
        <p class="stat-value">${E(t.ventas_hoy)}</p>
        <p class="stat-hint">Pagos confirmados de hoy</p>
      </article>

      <article class="stat-card tone-info">
        <div class="stat-top">
          <span class="stat-label">Pedidos hoy</span>
          <span class="stat-icon" aria-hidden="true">${M(`bolsa`)}</span>
        </div>
        <p class="stat-value">${Number(t.pedidos_hoy)||0}</p>
        <p class="stat-hint">Registrados en el día</p>
      </article>

      <article class="stat-card tone-warning">
        <div class="stat-top">
          <span class="stat-label">Pendientes de pago</span>
          <span class="stat-icon" aria-hidden="true">${M(`reloj`)}</span>
        </div>
        <p class="stat-value">${Number(t.pedidos_pendientes)||0}</p>
        <p class="stat-hint">Requieren seguimiento</p>
      </article>

      <article class="stat-card tone-warning">
        <div class="stat-top">
          <span class="stat-label">Stock bajo</span>
          <span class="stat-icon" aria-hidden="true">${M(`alerta`)}</span>
        </div>
        <p class="stat-value">${Number(t.stock_bajo)||0}</p>
        <p class="stat-hint">Productos con 5 unidades o menos</p>
      </article>

      <article class="stat-card tone-danger">
        <div class="stat-top">
          <span class="stat-label">Agotados</span>
          <span class="stat-icon" aria-hidden="true">${M(`agotado`)}</span>
        </div>
        <p class="stat-value">${Number(t.pizzas_agotadas)||0}</p>
        <p class="stat-hint">Sin stock disponible</p>
      </article>
    `}catch(t){e.innerHTML=`<p class="error">${w(t.message)}</p>`}}function H(){let e=document.querySelector(`#dashboard-pedidos`);if(e){if(!u){e.innerHTML=`<p class="loading-text">Cargando pedidos...</p>`;return}if(!Array.isArray(c)||c.length===0){e.innerHTML=`
      <div class="empty-state compact">
        <span aria-hidden="true">🧾</span>
        <p>Todavía no hay pedidos registrados.</p>
      </div>
    `;return}e.innerHTML=c.slice(0,5).map(e=>{let t=j(e.estado),n=e.telefono_whatsapp||e.direccion||`Pedido web`;return`
        <button type="button" class="mini-pedido" data-ver-pedido="${e.id}">
          <span class="mini-pedido-id">#${e.id}</span>
          <span class="mini-pedido-info">
            <strong>${w(n)}</strong>
            <small>${D(e.created_at)}</small>
          </span>
          <span class="badge-estado ${t.clase}">${w(t.label)}</span>
          <strong class="mini-pedido-total">${E(e.total)}</strong>
        </button>
      `}).join(``)}}function U(){let e=document.querySelector(`#dashboard-stock`);if(!e)return;if(!l){e.innerHTML=`<p class="loading-text">Cargando inventario...</p>`;return}let t=(Array.isArray(s)?s:[]).filter(e=>e.activo&&Number(e.stock)<=5).sort((e,t)=>Number(e.stock)-Number(t.stock)).slice(0,6);if(t.length===0){e.innerHTML=`
      <div class="empty-state compact">
        <span aria-hidden="true">✅</span>
        <p>Todo el inventario está en orden.</p>
      </div>
    `;return}e.innerHTML=t.map(e=>{let t=Number(e.stock)||0,n=t===0?`stock-cero`:`stock-bajo`;return`
        <div class="stock-alerta">
          <div class="stock-alerta-info">
            <strong>${w(e.nombre)}</strong>
            <small>${w(e.categoria||`Sin categoría`)}</small>
          </div>
          <span class="stock-chip ${n}">${t} uds.</span>
          <button
            type="button"
            class="btn-admin btn-admin-sm btn-admin-ghost"
            data-editar-producto="${e.id}"
          >
            Editar
          </button>
        </div>
      `}).join(``)}async function W(){let e=document.querySelector(`#pedidos-lista`);if(e)try{let e=await C(`/pedidos`);c=Array.isArray(e)?e:[],u=!0,K(),H(),q()}catch(t){u=!1,e.innerHTML=`<p class="error">${w(t.message)}</p>`}}function G(){let e=T(d);return(Array.isArray(c)?c:[]).filter(t=>{let n=t.estado===`PAGADO`?`PAGO_CONFIRMADO`:t.estado,r=f===`todos`||n===f,i=T(`${t.id} ${t.telefono_whatsapp||``} ${t.codigo_confirmacion||``} ${t.estado} ${t.metodo_pago||``} ${t.notas||``}`);return r&&(!e||i.includes(e))})}function K(){let e=document.querySelector(`#pedidos-lista`);if(!e)return;if(!u){e.innerHTML=`<p class="loading-text">Cargando pedidos...</p>`;return}let t=G();if(t.length===0){e.innerHTML=`
      <div class="empty-state">
        <span aria-hidden="true">🔎</span>
        <p>No hay pedidos que coincidan con los filtros.</p>
        <button type="button" class="btn-admin btn-admin-ghost" id="btn-limpiar-filtros-pedidos">
          Limpiar filtros
        </button>
      </div>
    `,e.querySelector(`#btn-limpiar-filtros-pedidos`)?.addEventListener(`click`,()=>{d=``,f=`todos`;let e=document.querySelector(`#pedidos-busqueda`),t=document.querySelector(`#pedidos-filtro-estado`);e&&(e.value=``),t&&(t.value=`todos`),K()});return}e.innerHTML=`
    <div class="tabla-wrap">
      <table class="tabla-pedidos">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Código</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${t.map(e=>{let t=j(e.estado),n=!e.pago_confirmado&&e.estado!==`CANCELADO`,r=e.pago_confirmado&&!e.codigo_usado&&e.estado!==`FINALIZADO`&&e.estado!==`CANCELADO`,i=e.estado!==`FINALIZADO`&&e.estado!==`CANCELADO`,a=e.telefono_whatsapp||e.direccion||`Pedido web`,o=e.metodo_pago||(e.telefono_whatsapp?`WhatsApp`:`Sin contacto`);return`
                <tr>
                  <td data-label="Pedido">
                    <strong class="order-id">#${e.id}</strong>
                  </td>
                  <td data-label="Cliente">
                    <span class="cliente-cell">
                      <strong>${w(a)}</strong>
                      <small>${w(o)}</small>
                    </span>
                  </td>
                  <td data-label="Estado">
                    <span class="badge-estado ${t.clase}">
                      ${w(t.label)}
                    </span>
                  </td>
                  <td data-label="Total">
                    <strong>${E(e.total)}</strong>
                  </td>
                  <td data-label="Código">
                    ${e.codigo_confirmacion&&e.estado!==`CANCELADO`?`<button type="button" class="codigo-chip" data-copiar-codigo="${w(e.codigo_confirmacion)}" title="Copiar código">${w(e.codigo_confirmacion)}</button>`:`<span class="text-muted">—</span>`}
                  </td>
                  <td data-label="Fecha">${D(e.created_at)}</td>
                  <td data-label="Acciones">
                    <div class="acciones-pedido">
                      <button
                        type="button"
                        class="btn-admin btn-admin-sm btn-admin-ghost"
                        data-ver-pedido="${e.id}"
                      >
                        Ver
                      </button>

                      ${n?`
                            <button
                              type="button"
                              class="btn-admin btn-admin-sm btn-admin-primary"
                              data-pagar-pedido="${e.id}"
                            >
                              Registrar pago
                            </button>
                          `:``}

                      ${r?`
                            <button
                              type="button"
                              class="btn-admin btn-admin-sm btn-admin-success"
                              data-finalizar-pedido="${e.id}"
                            >
                              Finalizar
                            </button>
                          `:``}

                      ${i?`
                            <button
                              type="button"
                              class="btn-admin btn-admin-sm btn-admin-danger"
                              data-cancelar-pedido="${e.id}"
                            >
                              Cancelar
                            </button>
                          `:``}
                    </div>
                  </td>
                </tr>
              `}).join(``)}
        </tbody>
      </table>
    </div>
  `}function q(){let e=document.querySelector(`#nav-pendientes`);if(!e)return;let t=(Array.isArray(c)?c:[]).filter(e=>e.estado===`PENDIENTE_PAGO`&&!e.pago_confirmado).length;e.textContent=String(t),e.hidden=t===0}async function se(e){let t=document.querySelector(`#modal-pedido-contenido`);if(t)try{let n=await C(`/pedidos/${e}`),r=j(n.estado),i=Array.isArray(n.detalles)?n.detalles:[],a=!n.pago_confirmado&&n.estado!==`CANCELADO`,o=n.pago_confirmado&&!n.codigo_usado&&n.estado!==`FINALIZADO`&&n.estado!==`CANCELADO`,s=n.estado!==`FINALIZADO`&&n.estado!==`CANCELADO`,c=n.estado===`CANCELADO`?`Devuelto al inventario`:n.stock_descontado?`Reservado`:`Sin reservar`,l=n.estado===`CANCELADO`&&n.pago_confirmado?`Confirmado · cancelado`:n.pago_confirmado?`Confirmado`:`Pendiente`;t.innerHTML=`
      <div class="modal-header">
        <div>
          <p class="modal-eyebrow">Detalle del pedido</p>
          <h2 id="modal-pedido-titulo">Pedido #${n.id}</h2>
        </div>
        <button type="button" class="modal-close" data-cerrar-modal="modal-pedido" aria-label="Cerrar">×</button>
      </div>

      <div class="modal-body">
        <div class="modal-meta">
          <div class="modal-meta-item">
            <span>Estado</span>
            <span class="badge-estado ${r.clase}">${w(r.label)}</span>
          </div>
          <div class="modal-meta-item">
            <span>Total</span>
            <strong>${E(n.total)}</strong>
          </div>
          <div class="modal-meta-item">
            <span>Pago</span>
            <strong>${l}</strong>
          </div>
          <div class="modal-meta-item">
            <span>Stock</span>
            <strong>${c}</strong>
          </div>
          <div class="modal-meta-item">
            <span>Código</span>
            ${n.codigo_confirmacion&&n.estado!==`CANCELADO`?`<button type="button" class="codigo-chip" data-copiar-codigo="${w(n.codigo_confirmacion)}" title="Copiar código">${w(n.codigo_confirmacion)}</button>`:`<strong>—</strong>`}
          </div>
          <div class="modal-meta-item">
            <span>Fecha</span>
            <strong>${D(n.created_at)}</strong>
          </div>
        </div>

        <div class="modal-data-grid">
          ${n.telefono_whatsapp?`<div class="modal-data"><span>WhatsApp</span><strong>${w(n.telefono_whatsapp)}</strong></div>`:``}
          ${n.metodo_pago?`<div class="modal-data"><span>Método de pago</span><strong>${w(n.metodo_pago)}</strong></div>`:``}
          ${n.direccion?`<div class="modal-data"><span>Dirección / barrio</span><strong>${w(n.direccion)}</strong></div>`:``}
          ${n.notas?`<div class="modal-data full"><span>Solicitudes</span><strong>${w(n.notas)}</strong></div>`:``}
        </div>

        <section class="modal-section">
          <h3>Productos</h3>
          <div class="modal-items">
            <div class="modal-items-head">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Subtotal</span>
            </div>
            ${i.map(e=>`
                  <div class="modal-item">
                    <span>${w(e.pizza_nombre)}</span>
                    <span>${Number(e.cantidad)||0}</span>
                    <strong>${E(e.subtotal)}</strong>
                  </div>
                `).join(``)}
          </div>
        </section>

        <div class="modal-actions">
          ${a?`<button type="button" class="btn-admin btn-admin-primary" data-pagar-pedido="${n.id}">Registrar pago</button>`:``}
          ${o?`<button type="button" class="btn-admin btn-admin-success" data-finalizar-pedido="${n.id}">Finalizar entrega</button>`:``}
          ${s?`<button type="button" class="btn-admin btn-admin-danger" data-cancelar-pedido="${n.id}">Cancelar pedido</button>`:``}
          <button type="button" class="btn-admin btn-admin-ghost" data-cerrar-modal="modal-pedido">Cerrar</button>
        </div>
      </div>
    `,R(`modal-pedido`)}catch(e){L(e.message,`error`)}}async function ce(e){if(c.find(t=>t.id===e)?.pago_confirmado){L(`Este pedido ya tiene el pago confirmado.`,`info`);return}if(window.confirm(`¿Registrar el pago del pedido #${e}?\n\nSe generará el código de entrega y se confirmará la venta.`))try{let t=(await C(`/pedidos/${e}/confirmar-pago`,{method:`POST`})).pedido?.codigo_confirmacion;z(`modal-pedido`),L(`Pago del pedido #${e} confirmado.${t?` Código: ${t}`:``}`),await Promise.all([W(),V(),J()])}catch(e){L(e.message,`error`)}}async function le(e){let t=c.find(t=>t.id===e)?.stock_descontado?`

Se devolverá el stock reservado al inventario.`:``;if(window.confirm(`¿Cancelar el pedido #${e}?${t}`))try{await C(`/pedidos/${e}/cancelar`,{method:`POST`}),z(`modal-pedido`),L(`Pedido #${e} cancelado.`),await Promise.all([W(),V(),J()])}catch(e){L(e.message,`error`)}}function ue(e){let t=c.find(t=>t.id===e);if(!t)return;if(!t.pago_confirmado){L(`Primero registra el pago del pedido.`,`info`);return}if(t.estado===`FINALIZADO`){L(`Este pedido ya fue finalizado.`,`info`);return}if(t.estado===`CANCELADO`){L(`Este pedido está cancelado.`,`info`);return}if(!t.codigo_confirmacion){L(`El pedido no tiene código de confirmación.`,`error`);return}let n=document.querySelector(`#pedido-id`),r=document.querySelector(`#pedido-codigo`);n&&(n.value=t.id),r&&(r.value=t.codigo_confirmacion),z(`modal-pedido`),R(`modal-finalizar`),r?.focus()}async function de(e){e.preventDefault();let t=document.querySelector(`#pedido-id`).value.trim(),n=document.querySelector(`#pedido-codigo`).value.trim(),r=e.currentTarget.querySelector(`button[type="submit"]`);if(!t||!n){L(`El ID del pedido y el código son obligatorios.`,`error`);return}try{r&&(r.disabled=!0,r.textContent=`Finalizando...`);let e=await C(`/pedidos/${t}/finalizar`,{method:`POST`,body:JSON.stringify({codigo:n})});document.querySelector(`#finalizar-pedido-form`).reset(),z(`modal-finalizar`),L(`Pedido #${e.pedido.id} finalizado correctamente.`),await Promise.all([W(),V()])}catch(e){L(e.message,`error`)}finally{r&&(r.disabled=!1,r.textContent=`Confirmar entrega`)}}async function fe(e){if(e)try{await navigator.clipboard.writeText(e),L(`Código ${e} copiado.`)}catch{L(`Código: ${e}`,`info`)}}async function J(){let e=document.querySelector(`#admin-pizzas`);if(e)try{let e=await C(`/pizzas/admin`);s=Array.isArray(e)?e:[],l=!0,ve(),Y(),U()}catch(t){l=!1,e.innerHTML=`<p class="error">${w(t.message)}</p>`}}async function pe(){try{v=(await C(`/configuracion/negocio`)).logo_url||null}catch{v=null}I()}async function me(e){e.preventDefault();let t=document.querySelector(`#logo-archivo`),n=t?.files?.[0],r=N(n);if(r){L(r,`error`);return}let i=e.currentTarget.querySelector(`button[type="submit"]`);try{i&&(i.disabled=!0,i.textContent=`Subiendo...`);let e=new FormData;e.append(`imagen`,n),v=(await C(`/configuracion/negocio/logo`,{method:`POST`,body:e})).logo_url||null,t&&(t.value=``),I(),L(`Logo del negocio actualizado.`)}catch(e){L(e.message,`error`)}finally{i&&(i.disabled=!1,i.textContent=`Guardar logo`)}}async function he(){if(!v){L(`El negocio ya usa el logo predeterminado.`,`info`);return}if(window.confirm(`¿Quitar el logo personalizado y volver al logo predeterminado?`))try{await C(`/configuracion/negocio/logo`,{method:`DELETE`}),v=null,I(),L(`Logo predeterminado restaurado.`)}catch(e){L(e.message,`error`)}}function ge(e){let t=e.currentTarget,n=t.files?.[0]||null,r=document.querySelector(`#imagen_url`).value.trim();if(!n){h=null,F(r);return}let i=N(n);if(i){t.value=``,h=null,L(i,`error`),F(r);return}h=n,document.querySelector(`#imagen_url`).value=``,F(``,n)}function _e(){h=null;let e=document.querySelector(`#imagen_archivo`);e&&(e.value=``),document.querySelector(`#imagen_url`).value=``,F()}function ve(){let e=document.querySelector(`#productos-filtro-categoria`),t=document.querySelector(`#categorias-producto`),n=[...new Set((Array.isArray(s)?s:[]).map(e=>String(e.categoria||``).trim()).filter(Boolean))].sort((e,t)=>e.localeCompare(t,`es`));if(e){let t=n.includes(m)?m:`todas`;m=t,e.innerHTML=`
      <option value="todas">Todas las categorías</option>
      ${n.map(e=>`<option value="${w(e)}">${w(e)}</option>`).join(``)}
    `,e.value=t}t&&(t.innerHTML=[...new Set([`Pizzas`,`Hamburguesas`,`Bebidas`,`Granizados`,`Acompañamientos`,`Postres`,`Combos`,`Otros`,...n])].map(e=>`<option value="${w(e)}"></option>`).join(``))}function ye(){let e=T(p);return(Array.isArray(s)?s:[]).filter(t=>{let n=String(t.categoria||``).trim(),r=m===`todas`||n===m,i=T(`${t.nombre} ${t.descripcion||``} ${n}`);return r&&(!e||i.includes(e))})}function Y(){let t=document.querySelector(`#admin-pizzas`);if(!t)return;if(!l){t.innerHTML=`<p class="loading-text">Cargando productos...</p>`;return}let n=ye();if(n.length===0){t.innerHTML=`
      <div class="empty-state">
        <span aria-hidden="true">📦</span>
        <p>No hay productos que coincidan con los filtros.</p>
      </div>
    `;return}t.innerHTML=n.map(t=>{let n=Number(t.stock)||0,r=n===0?`stock-cero`:n<=5?`stock-bajo`:`stock-ok`,i=String(t.categoria||`Pizzas`);return`
        <article class="pizza-card ${t.activo?``:`desactivada`}">
          <div class="pizza-image">
            ${t.imagen_url?`<img src="${w(e(t.imagen_url))}" alt="${w(t.nombre)}" loading="lazy" />`:`<div class="pizza-placeholder"><span aria-hidden="true">🍕</span><small>Sin imagen</small></div>`}
          </div>

          <div class="pizza-info">
            <div class="pizza-header">
              <div>
                <span class="producto-categoria">${w(i)}</span>
                <h3>${w(t.nombre)}</h3>
              </div>
              <span class="estado ${t.activo?`activo`:`inactivo`}">
                ${t.activo?`Activo`:`Inactivo`}
              </span>
            </div>

            <p class="pizza-descripcion">${w(t.descripcion)}</p>

            <div class="pizza-meta">
              <strong>${E(t.precio)}</strong>
              <span class="stock-chip ${r}">Stock: ${n}</span>
            </div>

            <div class="pizza-actions">
              <button
                type="button"
                class="btn-admin btn-admin-sm btn-admin-ghost"
                data-editar-producto="${t.id}"
              >
                Editar
              </button>

              ${t.activo?`
                    <button
                      type="button"
                      class="btn-admin btn-admin-sm btn-admin-danger"
                      data-desactivar-producto="${t.id}"
                    >
                      Desactivar
                    </button>
                  `:`
                    <button
                      type="button"
                      class="btn-admin btn-admin-sm btn-admin-success"
                      data-activar-producto="${t.id}"
                    >
                      Activar
                    </button>
                  `}
            </div>
          </div>
        </article>
      `}).join(``)}function be(e){let t=s.find(t=>t.id===e);if(!t)return;document.querySelector(`#pizza-id`).value=t.id,document.querySelector(`#nombre`).value=t.nombre,document.querySelector(`#descripcion`).value=t.descripcion,document.querySelector(`#precio`).value=t.precio,document.querySelector(`#stock`).value=t.stock;let n=t.imagen_url||``,r=document.querySelector(`#imagen_archivo`);g=n,h=null,r&&(r.value=``),document.querySelector(`#imagen_url`).value=n,F(n),document.querySelector(`#categoria`).value=t.categoria||`Pizzas`,document.querySelector(`#activo`).checked=!!t.activo,document.querySelector(`#form-title`).textContent=`Editar producto`,B(`productos`),window.setTimeout(()=>{document.querySelector(`.product-form-card`)?.scrollIntoView({behavior:`smooth`,block:`start`}),document.querySelector(`#nombre`)?.focus()},50)}async function xe(e){if(window.confirm(`¿Seguro que quieres desactivar este producto?`))try{await C(`/pizzas/${e}`,{method:`DELETE`}),L(`Producto desactivado correctamente.`),await Promise.all([J(),V()])}catch(e){L(e.message,`error`)}}async function Se(e){try{await C(`/pizzas/${e}/activar`,{method:`PATCH`}),L(`Producto activado correctamente.`),await Promise.all([J(),V()])}catch(e){L(e.message,`error`)}}async function Ce(e){e.preventDefault();let t=document.querySelector(`#pizza-id`).value,n=e.currentTarget.querySelector(`button[type="submit"]`),r=document.querySelector(`#nombre`).value.trim(),i=document.querySelector(`#descripcion`).value.trim(),a=Number(document.querySelector(`#precio`).value),o=Number(document.querySelector(`#stock`).value),s=document.querySelector(`#categoria`).value.trim()||`Pizzas`,c=document.querySelector(`#activo`).checked,l=document.querySelector(`#imagen_url`).value.trim(),u=g;if(!r||!i){L(`El nombre y la descripción son obligatorios.`,`error`);return}if(!Number.isFinite(a)||a<0){L(`El precio debe ser un número mayor o igual a 0.`,`error`);return}if(!Number.isInteger(o)||o<0){L(`El stock debe ser un entero mayor o igual a 0.`,`error`);return}try{n&&(n.disabled=!0,n.textContent=h?`Subiendo imagen...`:`Guardando...`);let e=l||null;h&&(e=(await re(h)).url,n&&(n.textContent=`Guardando...`));let d={nombre:r,descripcion:i,precio:a,stock:o,imagen_url:e,categoria:s,activo:c};t?await C(`/pizzas/${t}`,{method:`PUT`,body:JSON.stringify(d)}):await C(`/pizzas`,{method:`POST`,body:JSON.stringify(d)}),u&&u!==e&&await P(u),X(),L(t?`Producto actualizado correctamente.`:`Producto creado correctamente.`),await Promise.all([J(),V()])}catch(e){L(e.message,`error`)}finally{n&&(n.disabled=!1,n.textContent=`Guardar producto`)}}function X(){let e=document.querySelector(`#pizza-form`);if(!e)return;e.reset(),document.querySelector(`#pizza-id`).value=``,document.querySelector(`#activo`).checked=!0,document.querySelector(`#categoria`).value=`Pizzas`,document.querySelector(`#form-title`).textContent=`Nuevo producto`,h=null,g=``;let t=document.querySelector(`#imagen_archivo`);t&&(t.value=``),document.querySelector(`#imagen_url`).value=``,F()}async function Z(){let e=document.querySelector(`#reporte-mensual`),t=Number(document.querySelector(`#reporte-anio`)?.value),n=Number(document.querySelector(`#reporte-mes`)?.value);if(e){if(!Number.isInteger(t)||t<2e3){L(`Ingresa un año válido.`,`error`);return}if(!Number.isInteger(n)||n<1||n>12){L(`El mes debe estar entre 1 y 12.`,`error`);return}try{e.setAttribute(`aria-busy`,`true`),we(await C(`/reportes/mensual?anio=${t}&mes=${n}`))}catch(t){e.innerHTML=`<p class="error">${w(t.message)}</p>`}finally{e.removeAttribute(`aria-busy`)}}}function we(e){let t=document.querySelector(`#reporte-mensual`);if(!t)return;let n=Array.isArray(e.ventas_por_dia)?e.ventas_por_dia:[],r=e.pizza_mas_vendida,i=e.dia_mas_ventas;t.innerHTML=`
    <div class="reporte-grid">
      <article class="stat-card tone-success">
        <div class="stat-top">
          <span class="stat-label">Total vendido</span>
          <span class="stat-icon" aria-hidden="true">${M(`dinero`)}</span>
        </div>
        <p class="stat-value">${E(e.total_vendido)}</p>
        <p class="stat-hint">Ventas con pago confirmado</p>
      </article>

      <article class="stat-card tone-info">
        <div class="stat-top">
          <span class="stat-label">Pedidos</span>
          <span class="stat-icon" aria-hidden="true">${M(`bolsa`)}</span>
        </div>
        <p class="stat-value">${Number(e.total_pedidos)||0}</p>
        <p class="stat-hint">Pedidos pagados en el mes</p>
      </article>

      <article class="stat-card tone-neutral">
        <div class="stat-top">
          <span class="stat-label">Promedio por pedido</span>
          <span class="stat-icon" aria-hidden="true">${M(`tendencia`)}</span>
        </div>
        <p class="stat-value">${E(e.promedio_pedido)}</p>
        <p class="stat-hint">Ticket promedio del mes</p>
      </article>

      <article class="stat-card tone-warning">
        <div class="stat-top">
          <span class="stat-label">Producto más vendido</span>
          <span class="stat-icon" aria-hidden="true">${M(`estrella`)}</span>
        </div>
        <p class="stat-value stat-value-text">
          ${r?w(r.nombre):`Sin datos`}
        </p>
        <p class="stat-hint">
          ${r?`${Number(r.cantidad_vendida)||0} unidades vendidas`:`Aún no hay ventas este mes`}
        </p>
      </article>

      <article class="stat-card tone-info">
        <div class="stat-top">
          <span class="stat-label">Día con más ventas</span>
          <span class="stat-icon" aria-hidden="true">${M(`calendario`)}</span>
        </div>
        <p class="stat-value stat-value-text">
          ${i?k(i.dia):`Sin datos`}
        </p>
        <p class="stat-hint">
          ${i?E(i.total):`Aún no hay ventas este mes`}
        </p>
      </article>
    </div>

    <div class="reporte-panels">
      <article class="panel-card">
        <div class="panel-card-head">
          <div>
            <h2>Ventas por día</h2>
            <p>Compara el ingreso de cada día del mes.</p>
          </div>
        </div>
        ${Te(n)}
      </article>

      <article class="panel-card">
        <div class="panel-card-head">
          <div>
            <h2>Detalle diario</h2>
            <p>Pedidos y total vendido por fecha.</p>
          </div>
        </div>
        ${Ee(n)}
      </article>
    </div>
  `}function Te(e){if(e.length===0)return`
      <div class="empty-state compact">
        <span aria-hidden="true">📈</span>
        <p>No hay ventas registradas en este mes.</p>
      </div>
    `;let t=Math.max(...e.map(e=>Number(e.total)||0),1);return`
    <div class="report-chart" role="img" aria-label="Gráfico de ventas por día">
      ${e.map(e=>{let n=Number(e.total)||0,r=Math.max(5,Math.round(n/t*100));return`
            <div
              class="report-bar"
              title="${k(e.dia)}: ${E(n)} · ${Number(e.pedidos)||0} pedidos"
            >
              <span class="report-bar-track">
                <span class="report-bar-fill" style="height: ${r}%"></span>
              </span>
              <span class="report-bar-label">${A(e.dia)}</span>
            </div>
          `}).join(``)}
    </div>
  `}function Ee(e){return e.length===0?`
      <div class="empty-state compact">
        <span aria-hidden="true">🧾</span>
        <p>No hay pedidos pagados en este mes.</p>
      </div>
    `:`
    <div class="tabla-wrap">
      <table class="tabla-pedidos tabla-reporte">
        <thead>
          <tr>
            <th>Día</th>
            <th>Pedidos</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${e.map(e=>`
                <tr>
                  <td data-label="Día">${k(e.dia)}</td>
                  <td data-label="Pedidos">${Number(e.pedidos)||0}</td>
                  <td data-label="Total"><strong>${E(e.total)}</strong></td>
                </tr>
              `).join(``)}
        </tbody>
      </table>
    </div>
  `}async function Q(){let e=document.querySelector(`#btn-refresh`),t=e?.innerHTML;e&&(e.disabled=!0,e.textContent=`Actualizando...`),await Promise.all([V(),W(),J(),pe(),Z()]),e&&(e.disabled=!1,e.innerHTML=t)}function De(){document.querySelector(`#btn-refresh`)?.addEventListener(`click`,Q),document.querySelector(`#btn-refresh-pedidos`)?.addEventListener(`click`,W),document.querySelectorAll(`.admin-nav-item`).forEach(e=>e.addEventListener(`click`,()=>B(e.dataset.section))),document.addEventListener(`click`,e=>{let t=e.target.closest(`[data-goto]`);t&&B(t.dataset.goto)}),document.querySelector(`#pedidos-busqueda`)?.addEventListener(`input`,e=>{d=e.target.value,K()}),document.querySelector(`#pedidos-filtro-estado`)?.addEventListener(`change`,e=>{f=e.target.value,K()}),document.querySelector(`#productos-busqueda`)?.addEventListener(`input`,e=>{p=e.target.value,Y()}),document.querySelector(`#productos-filtro-categoria`)?.addEventListener(`change`,e=>{m=e.target.value,Y()}),document.querySelector(`#imagen_archivo`)?.addEventListener(`change`,ge),document.querySelector(`#btn-quitar-imagen`)?.addEventListener(`click`,_e),document.querySelector(`#logo-form`)?.addEventListener(`submit`,me),document.querySelector(`#btn-quitar-logo`)?.addEventListener(`click`,he),document.addEventListener(`click`,e=>{let t=e.target.closest(`[data-cerrar-modal]`);t&&z(t.dataset.cerrarModal)}),document.querySelectorAll(`dialog.admin-modal`).forEach(e=>{e.addEventListener(`click`,t=>{t.target===e&&e.close()})});let e=e=>{let t=e.target.closest(`[data-ver-pedido], [data-pagar-pedido], [data-finalizar-pedido], [data-cancelar-pedido], [data-copiar-codigo]`);t&&(t.dataset.verPedido?se(Number(t.dataset.verPedido)):t.dataset.pagarPedido?ce(Number(t.dataset.pagarPedido)):t.dataset.finalizarPedido?ue(Number(t.dataset.finalizarPedido)):t.dataset.cancelarPedido?le(Number(t.dataset.cancelarPedido)):t.dataset.copiarCodigo&&fe(t.dataset.copiarCodigo))};document.querySelector(`#pedidos-lista`)?.addEventListener(`click`,e),document.querySelector(`#dashboard-pedidos`)?.addEventListener(`click`,e),document.querySelector(`#modal-pedido-contenido`)?.addEventListener(`click`,e);let t=e=>{let t=e.target.closest(`[data-editar-producto], [data-desactivar-producto], [data-activar-producto]`);t&&(t.dataset.editarProducto?be(Number(t.dataset.editarProducto)):t.dataset.desactivarProducto?xe(Number(t.dataset.desactivarProducto)):t.dataset.activarProducto&&Se(Number(t.dataset.activarProducto)))};document.querySelector(`#admin-pizzas`)?.addEventListener(`click`,t),document.querySelector(`#dashboard-stock`)?.addEventListener(`click`,t),document.querySelector(`#admin-pizzas`)?.addEventListener(`error`,e=>{let t=e.target;if(!(t instanceof HTMLImageElement))return;let n=t.closest(`.pizza-image`);n&&(n.innerHTML=`
        <div class="pizza-placeholder">
          <span aria-hidden="true">🍕</span>
          <small>Sin imagen</small>
        </div>
      `)},!0),document.querySelector(`#imagen-preview`)?.addEventListener(`error`,e=>{if(!(e.target instanceof HTMLImageElement))return;let t=document.querySelector(`#imagen-preview`);t&&(t.innerHTML=`
        <div class="imagen-preview-placeholder">
          <span aria-hidden="true">🍕</span>
          <small>Sin imagen</small>
        </div>
      `)},!0),document.querySelector(`#logo-preview`)?.addEventListener(`error`,e=>{let t=e.target;t instanceof HTMLImageElement&&t.dataset.fallback!==`true`&&(t.dataset.fallback=`true`,t.src=`./el-callejon-logo.png`)},!0)}async function Oe(){De(),F(),await Q()}var $=new Date;S()?(document.querySelector(`#app`).innerHTML=`
    <main class="admin-shell">
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="admin-brand">
          <span class="admin-brand-mark" aria-hidden="true">🍕</span>
          <div>
            <strong>El Callejón</strong>
            <small>Administración</small>
          </div>
        </div>

        <nav class="admin-nav" aria-label="Secciones del panel">
          <button type="button" class="admin-nav-item activo" data-section="dashboard" aria-current="page">
            <span class="admin-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
            </span>
            <span>Dashboard</span>
          </button>

          <button type="button" class="admin-nav-item" data-section="pedidos">
            <span class="admin-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></svg>
            </span>
            <span>Pedidos</span>
            <span id="nav-pendientes" class="nav-badge" hidden>0</span>
          </button>

          <button type="button" class="admin-nav-item" data-section="productos">
            <span class="admin-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>
            </span>
            <span>Productos</span>
          </button>

          <button type="button" class="admin-nav-item" data-section="negocio">
            <span class="admin-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 10h16v10H4z"/><path d="M3 6h18l-1 4H4L3 6Z"/><path d="M9 14h6"/></svg>
            </span>
            <span>Negocio</span>
          </button>

          <button type="button" class="admin-nav-item" data-section="reportes">
            <span class="admin-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
            </span>
            <span>Reportes</span>
          </button>
        </nav>

        <div class="admin-sidebar-footer">
          <div class="admin-session">
            <span class="admin-avatar" aria-hidden="true">A</span>
            <div>
              <strong>admin</strong>
              <small>Sesión activa</small>
            </div>
          </div>
          <button type="button" id="btn-logout" class="btn-logout">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div class="admin-main">
        <header class="admin-topbar">
          <div class="admin-topbar-copy">
            <p class="admin-eyebrow">El Callejón · Administración</p>
            <h1 id="admin-page-title">Dashboard</h1>
            <p id="admin-page-subtitle">Resumen de ventas, pedidos y stock de tu negocio.</p>
          </div>
          <div class="admin-topbar-actions">
            <button type="button" id="btn-refresh" class="btn-admin btn-admin-ghost">
              <span class="btn-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M20 11a8 8 0 1 0-2.3 6.7"/><path d="M20 4v7h-7"/></svg>
              </span>
              Actualizar
            </button>
          </div>
        </header>

        <div class="admin-sections">
          <section class="admin-section activo" id="section-dashboard" aria-label="Dashboard">
            <div id="dashboard-stats" class="stats-grid">
              <p class="loading-text">Cargando resumen...</p>
            </div>

            <div class="dashboard-grid">
              <article class="panel-card">
                <div class="panel-card-head">
                  <div>
                    <h2>Últimos pedidos</h2>
                    <p>Los movimientos más recientes de tu negocio.</p>
                  </div>
                  <button type="button" class="btn-link" data-goto="pedidos">Ver todos</button>
                </div>
                <div id="dashboard-pedidos" class="mini-pedidos">
                  <p class="loading-text">Cargando pedidos...</p>
                </div>
              </article>

              <article class="panel-card">
                <div class="panel-card-head">
                  <div>
                    <h2>Stock en alerta</h2>
                    <p>Productos que necesitan tu atención.</p>
                  </div>
                  <button type="button" class="btn-link" data-goto="productos">Gestionar</button>
                </div>
                <div id="dashboard-stock" class="stock-alertas">
                  <p class="loading-text">Cargando inventario...</p>
                </div>
              </article>
            </div>
          </section>

          <section class="admin-section" id="section-pedidos" aria-label="Pedidos" hidden>
            <div class="section-toolbar">
              <label class="toolbar-search">
                <span class="sr-only">Buscar pedidos</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>
                <input id="pedidos-busqueda" type="search" placeholder="Buscar por #, teléfono o código..." autocomplete="off" />
              </label>

              <label class="toolbar-select">
                <span class="sr-only">Filtrar por estado</span>
                <select id="pedidos-filtro-estado">
                  <option value="todos">Todos los estados</option>
                  <option value="PENDIENTE_PAGO">Pendientes de pago</option>
                  <option value="PAGO_CONFIRMADO">Pagos confirmados</option>
                  <option value="FINALIZADO">Finalizados</option>
                  <option value="CANCELADO">Cancelados</option>
                </select>
              </label>

              <button type="button" id="btn-refresh-pedidos" class="btn-admin btn-admin-ghost">
                Actualizar
              </button>
            </div>

            <p class="section-hint">
              El stock se reserva al registrar el pedido. Si un pedido no se paga,
              cancélalo para devolver el stock al inventario.
            </p>

            <div id="pedidos-lista" class="panel-card panel-card-flush">
              <p class="loading-text">Cargando pedidos...</p>
            </div>
          </section>

          <section class="admin-section" id="section-productos" aria-label="Productos" hidden>
            <div class="products-layout">
              <article class="panel-card product-form-card">
                <div class="panel-card-head">
                  <div>
                    <h2 id="form-title">Nuevo producto</h2>
                    <p>Agrega productos o actualiza precios y stock.</p>
                  </div>
                </div>

                <form id="pizza-form" class="pizza-form">
                  <input type="hidden" id="pizza-id" />

                  <div class="form-grid">
                    <div class="form-group full">
                      <label for="nombre">Nombre</label>
                      <input id="nombre" type="text" required maxlength="150" />
                    </div>

                    <div class="form-group">
                      <label for="precio">Precio</label>
                      <input id="precio" type="number" min="0" step="100" required />
                    </div>

                    <div class="form-group">
                      <label for="categoria">Categoría</label>
                      <input id="categoria" type="text" list="categorias-producto" maxlength="80" required value="Pizzas" />
                      <datalist id="categorias-producto">
                        <option value="Pizzas"></option>
                        <option value="Hamburguesas"></option>
                        <option value="Bebidas"></option>
                        <option value="Granizados"></option>
                        <option value="Acompañamientos"></option>
                        <option value="Postres"></option>
                        <option value="Combos"></option>
                        <option value="Otros"></option>
                      </datalist>
                    </div>

                    <div class="form-group full">
                      <label for="descripcion">Descripción</label>
                      <textarea id="descripcion" required></textarea>
                    </div>

                    <div class="form-group">
                      <label for="stock">Stock</label>
                      <input id="stock" type="number" min="0" step="1" required />
                    </div>

                    <div class="form-group full">
                      <label for="imagen_archivo">Imagen del producto</label>
                      <input id="imagen_archivo" type="file" accept="image/*" />
                      <input id="imagen_url" type="hidden" />
                      <div id="imagen-preview" class="imagen-preview" aria-live="polite"></div>
                      <div class="imagen-acciones">
                        <button type="button" id="btn-quitar-imagen" class="btn-admin btn-admin-sm btn-admin-ghost" hidden>
                          Quitar imagen
                        </button>
                      </div>
                      <p class="form-ayuda">
                        JPG, PNG, WebP, GIF o AVIF. Máximo 5 MB. En el celular puedes elegirla desde la galería.
                      </p>
                    </div>

                    <div class="form-group full">
                      <label class="checkbox-label">
                        <input id="activo" type="checkbox" checked />
                        <span>Producto activo en el catálogo</span>
                      </label>
                    </div>
                  </div>

                  <div class="form-buttons">
                    <button type="submit" class="btn-admin btn-admin-primary">
                      Guardar producto
                    </button>
                    <button type="button" class="btn-admin btn-admin-ghost" id="btn-limpiar">
                      Limpiar
                    </button>
                  </div>
                </form>
              </article>

              <div class="products-list-wrap">
                <div class="section-toolbar">
                  <label class="toolbar-search">
                    <span class="sr-only">Buscar productos</span>
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>
                    <input id="productos-busqueda" type="search" placeholder="Buscar producto..." autocomplete="off" />
                  </label>

                  <label class="toolbar-select">
                    <span class="sr-only">Filtrar por categoría</span>
                    <select id="productos-filtro-categoria">
                      <option value="todas">Todas las categorías</option>
                    </select>
                  </label>
                </div>

                <div id="admin-pizzas" class="pizzas-grid">
                  <p class="loading-text">Cargando productos...</p>
                </div>
              </div>
            </div>
          </section>

          <section class="admin-section" id="section-negocio" aria-label="Negocio" hidden>
            <article class="panel-card">
              <div class="panel-card-head">
                <div>
                  <h2>Imagen del negocio</h2>
                  <p>Este logo se muestra en la cabecera del catálogo.</p>
                </div>
              </div>

              <div class="business-logo-layout">
                <div id="logo-preview" class="business-logo-preview" aria-live="polite"></div>

                <form id="logo-form" class="business-logo-form">
                  <div class="form-group">
                    <label for="logo-archivo">Archivo de imagen</label>
                    <input id="logo-archivo" type="file" accept="image/*" />
                    <p class="form-ayuda">
                      JPG, PNG, WebP, GIF o AVIF. Máximo 5 MB. En el celular puedes elegirla desde la galería.
                    </p>
                  </div>

                  <div class="form-buttons">
                    <button type="submit" class="btn-admin btn-admin-primary">
                      Guardar logo
                    </button>
                    <button type="button" id="btn-quitar-logo" class="btn-admin btn-admin-ghost" hidden>
                      Quitar logo
                    </button>
                  </div>
                </form>
              </div>
            </article>
          </section>

          <section class="admin-section" id="section-reportes" aria-label="Reportes" hidden>
            <article class="panel-card reporte-filtros-card">
              <div class="reporte-filtros">
                <label>
                  <span>Año</span>
                  <input id="reporte-anio" type="number" min="2000" value="${$.getFullYear()}" />
                </label>
                <label>
                  <span>Mes</span>
                  <input id="reporte-mes" type="number" min="1" max="12" value="${$.getMonth()+1}" />
                </label>
                <button type="button" id="btn-cargar-reporte" class="btn-admin btn-admin-primary">
                  Actualizar reporte
                </button>
              </div>
            </article>

            <div id="reporte-mensual">
              <p class="loading-text">Cargando reporte...</p>
            </div>
          </section>
        </div>
      </div>
    </main>

    <dialog id="modal-pedido" class="admin-modal" aria-labelledby="modal-pedido-titulo">
      <div id="modal-pedido-contenido"></div>
    </dialog>

    <dialog id="modal-finalizar" class="admin-modal" aria-labelledby="modal-finalizar-titulo">
      <div class="modal-header">
        <div>
          <p class="modal-eyebrow">Entrega</p>
          <h2 id="modal-finalizar-titulo">Finalizar pedido</h2>
        </div>
        <button type="button" class="modal-close" data-cerrar-modal="modal-finalizar" aria-label="Cerrar">×</button>
      </div>

      <form id="finalizar-pedido-form" class="modal-form">
        <p class="form-ayuda">
          Confirma la entrega con el código de confirmación del pedido. Puedes
          copiarlo desde la lista de pedidos o desde el detalle.
        </p>

        <div class="form-grid">
          <div class="form-group">
            <label for="pedido-id">ID del pedido</label>
            <input id="pedido-id" type="number" min="1" required placeholder="Ej: 4" />
          </div>
          <div class="form-group">
            <label for="pedido-codigo">Código de confirmación</label>
            <input id="pedido-codigo" type="text" required placeholder="Ej: PZ-3ZANQA" />
          </div>
        </div>

        <div class="form-buttons">
          <button type="submit" class="btn-admin btn-admin-success">
            Confirmar entrega
          </button>
          <button type="button" class="btn-admin btn-admin-ghost" data-cerrar-modal="modal-finalizar">
            Cancelar
          </button>
        </div>
      </form>
    </dialog>

    <div id="admin-toasts" class="toast-stack" aria-live="polite" aria-atomic="true"></div>
  `,document.querySelector(`#btn-logout`).addEventListener(`click`,oe),document.querySelector(`#finalizar-pedido-form`).addEventListener(`submit`,de),document.querySelector(`#pizza-form`).addEventListener(`submit`,Ce),document.querySelector(`#btn-limpiar`).addEventListener(`click`,X),document.querySelector(`#btn-cargar-reporte`).addEventListener(`click`,Z),Oe()):(document.querySelector(`#app`).innerHTML=`
    <main class="login-page">
      <section class="login-showcase" aria-label="El Callejón">
        <div class="login-showcase-top">
          <span class="login-logo" aria-hidden="true">🍕</span>
          <div>
            <p class="login-kicker">Pizzería artesanal</p>
            <h1>El Callejón</h1>
          </div>
        </div>

        <div class="login-showcase-copy">
          <h2>Todo tu negocio,<br />en un solo lugar.</h2>
          <p>
            Controla pedidos, pagos, inventario y ventas del mes desde un panel
            claro, rápido y pensado para el día a día.
          </p>
        </div>

        <ul class="login-benefits">
          <li><span aria-hidden="true">✓</span> Pedidos y pagos en tiempo real</li>
          <li><span aria-hidden="true">✓</span> Stock que se descuenta automáticamente</li>
          <li><span aria-hidden="true">✓</span> Reportes de ventas por día y por mes</li>
        </ul>
      </section>

      <form id="login-form" class="login-card">
        <p class="login-eyebrow">Panel de administración</p>
        <h2>Bienvenido de nuevo</h2>
        <p class="login-lead">Ingresa tus credenciales para continuar.</p>

        <label class="login-field">
          <span>Usuario</span>
          <input id="login-usuario" type="text" required autocomplete="username" placeholder="admin" />
        </label>

        <label class="login-field">
          <span>Contraseña</span>
          <input id="login-password" type="password" required autocomplete="current-password" placeholder="••••••••" />
        </label>

        <button type="submit" class="btn-admin btn-admin-primary btn-block">
          Iniciar sesión
        </button>
        <div id="login-resultado" aria-live="polite"></div>

        <p class="login-footnote">
          Acceso exclusivo para el equipo de El Callejón.
        </p>
      </form>
    </main>
  `,document.querySelector(`#login-form`).addEventListener(`submit`,ae));
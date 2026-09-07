import"./modulepreload-polyfill-P2Xu9kJm.js";var e=`http://localhost:3000/api`,t=`pizza_admin_token`,n=[],r=[];function i(){return localStorage.getItem(t)}function a(e){localStorage.setItem(t,e)}function o(){localStorage.removeItem(t)}function s(){return!!i()}async function c(t,n={}){let r={"Content-Type":`application/json`,...n.headers||{}},a=i();a&&(r.Authorization=`Bearer ${a}`);let s=await fetch(`${e}${t}`,{...n,headers:r}),c=await s.json().catch(()=>({}));if(s.status===401)throw o(),Error(c.error||`Sesión expirada. Vuelve a iniciar sesión.`);if(!s.ok)throw Error(c.error||`Error en la solicitud`);return c}function l(e){return`$${Number(e).toLocaleString(`es-CO`)}`}function u(e){return new Date(e).toLocaleString(`es-CO`)}async function d(e){e.preventDefault();let t=document.querySelector(`#login-usuario`).value.trim(),n=document.querySelector(`#login-password`).value,r=document.querySelector(`#login-resultado`);try{a((await c(`/auth/login`,{method:`POST`,body:JSON.stringify({usuario:t,password:n})})).token),window.location.reload()}catch(e){r.innerHTML=`<p class="error">${e.message}</p>`}}function f(){o(),window.location.reload()}async function p(){let e=document.querySelector(`#dashboard-stats`);if(e)try{let t=await c(`/reportes/dashboard`);e.innerHTML=`
      <article class="stat-card">
        <h3>Ventas hoy</h3>
        <p>${l(t.ventas_hoy)}</p>
      </article>
      <article class="stat-card">
        <h3>Pedidos hoy</h3>
        <p>${t.pedidos_hoy}</p>
      </article>
      <article class="stat-card">
        <h3>Pendientes de pago</h3>
        <p>${t.pedidos_pendientes}</p>
      </article>
      <article class="stat-card">
        <h3>Stock bajo</h3>
        <p>${t.stock_bajo}</p>
      </article>
      <article class="stat-card">
        <h3>Agotadas</h3>
        <p>${t.pizzas_agotadas}</p>
      </article>
    `}catch(t){e.innerHTML=`<p class="error">${t.message}</p>`}}async function m(){let e=document.querySelector(`#reporte-mensual`),t=Number(document.querySelector(`#reporte-anio`)?.value),n=Number(document.querySelector(`#reporte-mes`)?.value);if(e)try{let r=await c(`/reportes/mensual?anio=${t}&mes=${n}`);e.innerHTML=`
      <div class="reporte-grid">
        <article class="stat-card">
          <h3>Total vendido</h3>
          <p>${l(r.total_vendido)}</p>
        </article>
        <article class="stat-card">
          <h3>Pedidos</h3>
          <p>${r.total_pedidos}</p>
        </article>
        <article class="stat-card">
          <h3>Promedio por pedido</h3>
          <p>${l(r.promedio_pedido)}</p>
        </article>
        <article class="stat-card">
          <h3>Pizza más vendida</h3>
          <p>
            ${r.pizza_mas_vendida?`${r.pizza_mas_vendida.nombre} (${r.pizza_mas_vendida.cantidad_vendida})`:`Sin datos`}
          </p>
        </article>
        <article class="stat-card">
          <h3>Día con más ventas</h3>
          <p>
            ${r.dia_mas_ventas?`${new Date(r.dia_mas_ventas.dia).toLocaleDateString(`es-CO`)} · ${l(r.dia_mas_ventas.total)}`:`Sin datos`}
          </p>
        </article>
      </div>
    `}catch(t){e.innerHTML=`<p class="error">${t.message}</p>`}}async function h(){let e=document.querySelector(`#pedidos-lista`);if(e)try{if(r=await c(`/pedidos`),r.length===0){e.innerHTML=`<p>No hay pedidos registrados.</p>`;return}e.innerHTML=`
      <div class="tabla-wrap">
        <table class="tabla-pedidos">
          <thead>
            <tr>
              <th>#</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Código</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${r.map(e=>`
                  <tr>
                    <td>${e.id}</td>
                    <td>
                      <span class="badge-estado ${e.estado.toLowerCase()}">
                        ${e.estado}
                      </span>
                    </td>
                    <td>${l(e.total)}</td>
                    <td>${e.codigo_confirmacion||`—`}</td>
                    <td>${u(e.created_at)}</td>
                    <td class="acciones-pedido">
                      <button type="button" onclick="verPedido(${e.id})">
                        Ver
                      </button>
                      ${e.estado!==`FINALIZADO`&&e.estado!==`CANCELADO`?`
                            <button
                              type="button"
                              class="danger"
                              onclick="cancelarPedido(${e.id})"
                            >
                              Cancelar
                            </button>
                          `:``}
                    </td>
                  </tr>
                `).join(``)}
          </tbody>
        </table>
      </div>
      <div id="pedido-detalle"></div>
    `}catch(t){e.innerHTML=`<p class="error">${t.message}</p>`}}window.verPedido=async function(e){let t=document.querySelector(`#pedido-detalle`);try{let n=await c(`/pedidos/${e}`);t.innerHTML=`
      <div class="pedido-detalle-card">
        <h3>Pedido #${n.id}</h3>
        <p><strong>Estado:</strong> ${n.estado}</p>
        <p><strong>Total:</strong> ${l(n.total)}</p>
        <p><strong>Código:</strong> ${n.codigo_confirmacion||`—`}</p>
        <ul>
          ${n.detalles.map(e=>`
                <li>
                  ${e.pizza_nombre} × ${e.cantidad}
                  — ${l(e.subtotal)}
                </li>
              `).join(``)}
        </ul>
      </div>
    `}catch(e){t.innerHTML=`<p class="error">${e.message}</p>`}},window.cancelarPedido=async function(e){if(confirm(`¿Cancelar el pedido #${e}?`))try{await c(`/pedidos/${e}/cancelar`,{method:`POST`}),await Promise.all([h(),p(),_()])}catch(e){alert(e.message)}};async function g(e){e.preventDefault();let t=document.querySelector(`#pedido-id`).value.trim(),n=document.querySelector(`#pedido-codigo`).value.trim(),r=document.querySelector(`#finalizar-resultado`),i=e.target.querySelector(`button[type="submit"]`);try{i&&(i.disabled=!0);let e=await c(`/pedidos/${t}/finalizar`,{method:`POST`,body:JSON.stringify({codigo:n})});document.querySelector(`#finalizar-pedido-form`).reset(),r.innerHTML=`
      <div class="pedido-exito">
        <strong>Pedido #${e.pedido.id} finalizado</strong>
        <p>Estado: ${e.pedido.estado}</p>
      </div>
    `,await Promise.all([h(),p()])}catch(e){r.innerHTML=`<p class="error">${e.message}</p>`}finally{i&&(i.disabled=!1)}}async function _(){try{n=await c(`/pizzas/admin`),v()}catch(e){if(console.error(e),String(e.message).includes(`Sesión`)){window.location.reload();return}document.querySelector(`#admin-pizzas`).innerHTML=`
      <p class="error">${e.message}</p>
    `}}function v(){let e=document.querySelector(`#admin-pizzas`);if(e){if(n.length===0){e.innerHTML=`<p>No hay pizzas registradas.</p>`;return}e.innerHTML=n.map(e=>`
        <article class="pizza-card ${e.activo?``:`desactivada`}">
          <div class="pizza-image">
            ${e.imagen_url?`<img src="${e.imagen_url}" alt="${e.nombre}" />`:`<div class="pizza-placeholder">Sin imagen</div>`}
          </div>
          <div class="pizza-info">
            <div class="pizza-header">
              <h3>${e.nombre}</h3>
              <span class="estado ${e.activo?`activo`:`inactivo`}">
                ${e.activo?`Activa`:`Inactiva`}
              </span>
            </div>
            <p>${e.descripcion}</p>
            <strong>${l(e.precio)}</strong>
            <span>Stock: ${e.stock}</span>
            <div class="pizza-actions">
              <button onclick="editarPizza(${e.id})">Editar</button>
              ${e.activo?`<button class="danger" onclick="desactivarPizza(${e.id})">Desactivar</button>`:`<button class="success" onclick="activarPizza(${e.id})">Activar</button>`}
            </div>
          </div>
        </article>
      `).join(``)}}window.editarPizza=function(e){let t=n.find(t=>t.id===e);t&&(document.querySelector(`#pizza-id`).value=t.id,document.querySelector(`#nombre`).value=t.nombre,document.querySelector(`#descripcion`).value=t.descripcion,document.querySelector(`#precio`).value=t.precio,document.querySelector(`#stock`).value=t.stock,document.querySelector(`#imagen_url`).value=t.imagen_url||``,document.querySelector(`#activo`).checked=t.activo,document.querySelector(`#form-title`).textContent=`Editar pizza`,document.querySelector(`#pizza-form`)?.scrollIntoView({behavior:`smooth`}))},window.desactivarPizza=async function(e){if(confirm(`¿Seguro que quieres desactivar esta pizza?`))try{await c(`/pizzas/${e}`,{method:`DELETE`}),await _()}catch(e){alert(e.message)}},window.activarPizza=async function(e){try{await c(`/pizzas/${e}/activar`,{method:`PATCH`}),await _()}catch(e){alert(e.message)}};async function y(e){e.preventDefault();let t=document.querySelector(`#pizza-id`).value,n={nombre:document.querySelector(`#nombre`).value,descripcion:document.querySelector(`#descripcion`).value,precio:Number(document.querySelector(`#precio`).value),stock:Number(document.querySelector(`#stock`).value),imagen_url:document.querySelector(`#imagen_url`).value,activo:document.querySelector(`#activo`).checked};try{t?await c(`/pizzas/${t}`,{method:`PUT`,body:JSON.stringify(n)}):await c(`/pizzas`,{method:`POST`,body:JSON.stringify(n)}),b(),await Promise.all([_(),p()]),alert(t?`Pizza actualizada correctamente`:`Pizza creada correctamente`)}catch(e){alert(e.message)}}function b(){document.querySelector(`#pizza-form`).reset(),document.querySelector(`#pizza-id`).value=``,document.querySelector(`#activo`).checked=!0,document.querySelector(`#form-title`).textContent=`Nueva pizza`}window.limpiarFormulario=b;async function x(){await Promise.all([p(),h(),_(),m()])}var S=new Date;s()?(document.querySelector(`#app`).innerHTML=`
    <main class="admin">
      <header class="admin-header">
        <div>
          <h1>🍕 Pizza Negocio</h1>
          <p>Panel de administración</p>
        </div>
        <button type="button" id="btn-logout" class="btn-logout">
          Cerrar sesión
        </button>
      </header>

      <section class="admin-content">

        <section class="panel-section">
          <h2>Dashboard</h2>
          <div id="dashboard-stats" class="stats-grid">
            <p>Cargando...</p>
          </div>
        </section>

        <section class="panel-section">
          <h2>Reportes del mes</h2>
          <div class="reporte-filtros">
            <label>
              Año
              <input id="reporte-anio" type="number" value="${S.getFullYear()}" />
            </label>
            <label>
              Mes
              <input id="reporte-mes" type="number" min="1" max="12" value="${S.getMonth()+1}" />
            </label>
            <button type="button" id="btn-cargar-reporte">
              Actualizar reporte
            </button>
          </div>
          <div id="reporte-mensual"></div>
        </section>

        <section class="panel-section">
          <h2>Pedidos</h2>
          <div id="pedidos-lista">
            <p>Cargando pedidos...</p>
          </div>
        </section>

        <form id="finalizar-pedido-form" class="pizza-form finalizar-form">
          <h2>Finalizar pedido</h2>
          <p class="form-ayuda">
            Ingresa el ID del pedido y el código que recibió el cliente al pagar.
          </p>

          <div class="form-grid">
            <div class="form-group">
              <label>ID del pedido</label>
              <input id="pedido-id" type="number" min="1" required placeholder="Ej: 4" />
            </div>
            <div class="form-group">
              <label>Código de confirmación</label>
              <input id="pedido-codigo" type="text" required placeholder="Ej: PZ-3ZANQA" />
            </div>
          </div>

          <div class="form-buttons">
            <button type="submit" class="success">Confirmar entrega</button>
          </div>
          <div id="finalizar-resultado"></div>
        </form>

        <form id="pizza-form" class="pizza-form">
          <h2 id="form-title">Nueva pizza</h2>
          <input type="hidden" id="pizza-id" />

          <div class="form-grid">
            <div class="form-group">
              <label>Nombre</label>
              <input id="nombre" type="text" required />
            </div>
            <div class="form-group">
              <label>Precio</label>
              <input id="precio" type="number" min="0" required />
            </div>
            <div class="form-group full">
              <label>Descripción</label>
              <textarea id="descripcion" required></textarea>
            </div>
            <div class="form-group">
              <label>Stock</label>
              <input id="stock" type="number" min="0" required />
            </div>
            <div class="form-group">
              <label>Imagen URL</label>
              <input id="imagen_url" type="url" />
            </div>
            <div class="form-group">
              <label>
                <input id="activo" type="checkbox" checked />
                Pizza activa
              </label>
            </div>
          </div>

          <div class="form-buttons">
            <button type="submit">Guardar pizza</button>
            <button type="button" class="secondary" id="btn-limpiar">Limpiar</button>
          </div>
        </form>

        <section>
          <h2>🍕 Pizzas registradas</h2>
          <div id="admin-pizzas" class="pizzas-grid">
            <p>Cargando pizzas...</p>
          </div>
        </section>

      </section>
    </main>
  `,document.querySelector(`#btn-logout`).addEventListener(`click`,f),document.querySelector(`#finalizar-pedido-form`).addEventListener(`submit`,g),document.querySelector(`#pizza-form`).addEventListener(`submit`,y),document.querySelector(`#btn-limpiar`).addEventListener(`click`,b),document.querySelector(`#btn-cargar-reporte`).addEventListener(`click`,m),x()):(document.querySelector(`#app`).innerHTML=`
    <main class="login-page">
      <form id="login-form" class="login-card">
        <h1>🍕 Pizza Negocio</h1>
        <p>Panel de administración</p>

        <label>
          Usuario
          <input id="login-usuario" type="text" required autocomplete="username" />
        </label>

        <label>
          Contraseña
          <input id="login-password" type="password" required autocomplete="current-password" />
        </label>

        <button type="submit">Iniciar sesión</button>
        <div id="login-resultado"></div>
      </form>
    </main>
  `,document.querySelector(`#login-form`).addEventListener(`submit`,d));
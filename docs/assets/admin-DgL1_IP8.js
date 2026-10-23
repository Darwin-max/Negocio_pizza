import{t as e}from"./api-B-s7tTxe.js";var t=e(`/api`),n=`pizza_admin_token`,r=[],i=[];function a(){return localStorage.getItem(n)}function o(e){localStorage.setItem(n,e)}function s(){localStorage.removeItem(n)}function c(){return!!a()}async function l(e,n={}){let r={"Content-Type":`application/json`,...n.headers||{}},i=a();i&&(r.Authorization=`Bearer ${i}`);let o=await fetch(`${t}${e}`,{...n,headers:r}),c=await o.json().catch(()=>({}));if(o.status===401)throw s(),Error(c.error||`Sesión expirada. Vuelve a iniciar sesión.`);if(!o.ok)throw Error(c.error||`Error en la solicitud`);return c}function u(e){return`$${Number(e).toLocaleString(`es-CO`)}`}function d(e){return new Date(e).toLocaleString(`es-CO`)}function f(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}async function p(e){e.preventDefault();let t=document.querySelector(`#login-usuario`).value.trim(),n=document.querySelector(`#login-password`).value,r=document.querySelector(`#login-resultado`);try{o((await l(`/auth/login`,{method:`POST`,body:JSON.stringify({usuario:t,password:n})})).token),window.location.reload()}catch(e){r.innerHTML=`<p class="error">${e.message}</p>`}}function m(){s(),window.location.reload()}async function h(){let e=document.querySelector(`#dashboard-stats`);if(e)try{let t=await l(`/reportes/dashboard`);e.innerHTML=`
      <article class="stat-card">
        <h3>Ventas hoy</h3>
        <p>${u(t.ventas_hoy)}</p>
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
    `}catch(t){e.innerHTML=`<p class="error">${t.message}</p>`}}async function g(){let e=document.querySelector(`#reporte-mensual`),t=Number(document.querySelector(`#reporte-anio`)?.value),n=Number(document.querySelector(`#reporte-mes`)?.value);if(e)try{let r=await l(`/reportes/mensual?anio=${t}&mes=${n}`);e.innerHTML=`
      <div class="reporte-grid">
        <article class="stat-card">
          <h3>Total vendido</h3>
          <p>${u(r.total_vendido)}</p>
        </article>
        <article class="stat-card">
          <h3>Pedidos</h3>
          <p>${r.total_pedidos}</p>
        </article>
        <article class="stat-card">
          <h3>Promedio por pedido</h3>
          <p>${u(r.promedio_pedido)}</p>
        </article>
        <article class="stat-card">
          <h3>Producto más vendido</h3>
          <p>
            ${r.pizza_mas_vendida?`${r.pizza_mas_vendida.nombre} (${r.pizza_mas_vendida.cantidad_vendida})`:`Sin datos`}
          </p>
        </article>
        <article class="stat-card">
          <h3>Día con más ventas</h3>
          <p>
            ${r.dia_mas_ventas?`${new Date(r.dia_mas_ventas.dia).toLocaleDateString(`es-CO`)} · ${u(r.dia_mas_ventas.total)}`:`Sin datos`}
          </p>
        </article>
      </div>
    `}catch(t){e.innerHTML=`<p class="error">${t.message}</p>`}}async function _(){let e=document.querySelector(`#pedidos-lista`);if(e)try{if(i=await l(`/pedidos`),i.length===0){e.innerHTML=`<p>No hay pedidos registrados.</p>`;return}e.innerHTML=`
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
            ${i.map(e=>`
                  <tr>
                    <td>${e.id}</td>
                    <td>
                      <span class="badge-estado ${e.estado.toLowerCase()}">
                        ${e.estado}
                      </span>
                    </td>
                    <td>
                      ${u(e.total)}
                      ${e.telefono_whatsapp?`<small>Subtotal de pizzas</small>`:``}
                    </td>
                    <td>${e.codigo_confirmacion||`—`}</td>
                    <td>${d(e.created_at)}</td>
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
    `}catch(t){e.innerHTML=`<p class="error">${t.message}</p>`}}window.verPedido=async function(e){let t=document.querySelector(`#pedido-detalle`);try{let n=await l(`/pedidos/${e}`);t.innerHTML=`
      <div class="pedido-detalle-card">
        <h3>Pedido #${n.id}</h3>
        <p><strong>Estado:</strong> ${n.estado}</p>
        <p><strong>${n.telefono_whatsapp?`Subtotal de pizzas`:`Total`}:</strong> ${u(n.total)}</p>
        <p><strong>Código:</strong> ${n.codigo_confirmacion||`—`}</p>
        ${n.telefono_whatsapp?`<p><strong>WhatsApp:</strong> ${f(n.telefono_whatsapp)}</p>`:``}
        ${n.metodo_pago?`<p><strong>Método de pago preferido:</strong> ${f(n.metodo_pago)}</p>`:``}
        ${n.direccion?`<p><strong>Dirección / barrio:</strong> ${f(n.direccion)}</p>`:``}
        ${n.notas?`<p><strong>Solicitudes:</strong> ${f(n.notas)}</p>`:``}
        <ul>
          ${n.detalles.map(e=>`
                <li>
                  ${f(e.pizza_nombre)} × ${e.cantidad}
                  — ${u(e.subtotal)}
                </li>
              `).join(``)}
        </ul>
      </div>
    `}catch(e){t.innerHTML=`<p class="error">${e.message}</p>`}},window.cancelarPedido=async function(e){if(confirm(`¿Cancelar el pedido #${e}?`))try{await l(`/pedidos/${e}/cancelar`,{method:`POST`}),await Promise.all([_(),h(),y()])}catch(e){alert(e.message)}};async function v(e){e.preventDefault();let t=document.querySelector(`#pedido-id`).value.trim(),n=document.querySelector(`#pedido-codigo`).value.trim(),r=document.querySelector(`#finalizar-resultado`),i=e.currentTarget.querySelector(`button[type="submit"]`);if(!t||!n){r.innerHTML=`<p class="error">El ID del pedido y el código son obligatorios.</p>`;return}try{i&&(i.disabled=!0);let e=await l(`/pedidos/${t}/finalizar`,{method:`POST`,body:JSON.stringify({codigo:n})});document.querySelector(`#finalizar-pedido-form`).reset(),r.innerHTML=`
      <div class="pedido-exito">
        <strong>Pedido #${e.pedido.id} finalizado</strong>
        <p>Estado: ${e.pedido.estado}</p>
      </div>
    `,await Promise.all([_(),h()])}catch(e){r.innerHTML=`<p class="error">${e.message}</p>`}finally{i&&(i.disabled=!1)}}async function y(){try{r=await l(`/pizzas/admin`),b()}catch(e){if(console.error(e),String(e.message).includes(`Sesión`)){window.location.reload();return}document.querySelector(`#admin-pizzas`).innerHTML=`
      <p class="error">${e.message}</p>
    `}}function b(){let e=document.querySelector(`#admin-pizzas`);if(e){if(r.length===0){e.innerHTML=`    <p>No hay productos registrados.</p>`;return}e.innerHTML=r.map(e=>`
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
            <span class="producto-categoria">${f(e.categoria||`Pizzas`)}</span>
            <strong>${u(e.precio)}</strong>
            <span>Stock: ${e.stock}</span>
            <div class="pizza-actions">
              <button onclick="editarPizza(${e.id})">Editar</button>
              ${e.activo?`<button class="danger" onclick="desactivarPizza(${e.id})">Desactivar</button>`:`<button class="success" onclick="activarPizza(${e.id})">Activar</button>`}
            </div>
          </div>
        </article>
      `).join(``)}}window.editarPizza=function(e){let t=r.find(t=>t.id===e);t&&(document.querySelector(`#pizza-id`).value=t.id,document.querySelector(`#nombre`).value=t.nombre,document.querySelector(`#descripcion`).value=t.descripcion,document.querySelector(`#precio`).value=t.precio,document.querySelector(`#stock`).value=t.stock,document.querySelector(`#imagen_url`).value=t.imagen_url||``,document.querySelector(`#categoria`).value=t.categoria||`Pizzas`,document.querySelector(`#activo`).checked=t.activo,document.querySelector(`#form-title`).textContent=`Editar producto`,document.querySelector(`#pizza-form`)?.scrollIntoView({behavior:`smooth`}))},window.desactivarPizza=async function(e){if(confirm(`¿Seguro que quieres desactivar este producto?`))try{await l(`/pizzas/${e}`,{method:`DELETE`}),await y()}catch(e){alert(e.message)}},window.activarPizza=async function(e){try{await l(`/pizzas/${e}/activar`,{method:`PATCH`}),await y()}catch(e){alert(e.message)}};async function x(e){e.preventDefault();let t=document.querySelector(`#pizza-id`).value,n={nombre:document.querySelector(`#nombre`).value,descripcion:document.querySelector(`#descripcion`).value,precio:Number(document.querySelector(`#precio`).value),stock:Number(document.querySelector(`#stock`).value),imagen_url:document.querySelector(`#imagen_url`).value,categoria:document.querySelector(`#categoria`).value.trim(),activo:document.querySelector(`#activo`).checked};try{t?await l(`/pizzas/${t}`,{method:`PUT`,body:JSON.stringify(n)}):await l(`/pizzas`,{method:`POST`,body:JSON.stringify(n)}),S(),await Promise.all([y(),h()]),alert(t?`Producto actualizado correctamente`:`Producto creado correctamente`)}catch(e){alert(e.message)}}function S(){document.querySelector(`#pizza-form`).reset(),document.querySelector(`#pizza-id`).value=``,document.querySelector(`#activo`).checked=!0,document.querySelector(`#categoria`).value=`Pizzas`,document.querySelector(`#form-title`).textContent=`Nuevo producto`}window.limpiarFormulario=S;async function C(){await Promise.all([h(),_(),y(),g()])}var w=new Date;c()?(document.querySelector(`#app`).innerHTML=`
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
              <input id="reporte-anio" type="number" value="${w.getFullYear()}" />
            </label>
            <label>
              Mes
              <input id="reporte-mes" type="number" min="1" max="12" value="${w.getMonth()+1}" />
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
          <h2 id="form-title">Nuevo producto</h2>
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
                Producto activo
              </label>
            </div>
          </div>

          <div class="form-buttons">
            <button type="submit">Guardar producto</button>
            <button type="button" class="secondary" id="btn-limpiar">Limpiar</button>
          </div>
        </form>

        <section>
          <h2>📦 Productos registrados</h2>
          <div id="admin-pizzas" class="pizzas-grid">
            <p>Cargando productos...</p>
          </div>
        </section>

      </section>
    </main>
  `,document.querySelector(`#btn-logout`).addEventListener(`click`,m),document.querySelector(`#finalizar-pedido-form`).addEventListener(`submit`,v),document.querySelector(`#pizza-form`).addEventListener(`submit`,x),document.querySelector(`#btn-limpiar`).addEventListener(`click`,S),document.querySelector(`#btn-cargar-reporte`).addEventListener(`click`,g),C()):(document.querySelector(`#app`).innerHTML=`
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
  `,document.querySelector(`#login-form`).addEventListener(`submit`,p));
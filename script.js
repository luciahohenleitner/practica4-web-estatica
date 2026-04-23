const API_URL = 'http://localhost:8080/carritos';

document.addEventListener('DOMContentLoaded', iniciar);

function iniciar() {
  registrarEventosProductos();

  const botonActualizar = document.getElementById('boton-actualizar');
  if (botonActualizar) {
    botonActualizar.addEventListener('click', actualizarCarrito);
  }

  if (document.getElementById('cuerpo-carrito')) {
    actualizarCarrito();
  }
}

function registrarEventosProductos() {
  const botones = document.querySelectorAll('.btn-anadir');

  if (botones.length === 0) {
    return;
  }

  botones.forEach((boton) => {
    boton.addEventListener('click', async () => {
      cambiarEstadoBoton(boton, true, 'Añadiendo...');

      const producto = {
        idArticulo: Number(boton.dataset.idarticulo),
        descripcion: boton.dataset.descripcion,
        unidades: 1,
        precioFinal: Number(boton.dataset.precio)
      };

      try {
        await crearElementoCarrito(producto);
        mostrarEstadoProductos(`Producto añadido: ${producto.descripcion}`);
      } catch (error) {
        console.error(error);
        mostrarEstadoProductos(`Error al añadir el producto (${error.message})`, true);
      } finally {
        cambiarEstadoBoton(boton, false, 'Añadir al carrito');
      }
    });
  });
}

async function crearElementoCarrito(producto) {
  try {
    const respuesta = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(producto)
    });

    if (respuesta.ok) {
      return await respuesta.json();
    } else {
      throw new Error(`HTTP ${respuesta.status}`);
    }
  } catch (error) {
    throw error;
  }
}

async function obtenerCarrito() {
  try {
    const respuesta = await fetch(API_URL, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (respuesta.ok) {
      return await respuesta.json();
    } else {
      throw new Error(`HTTP ${respuesta.status}`);
    }
  } catch (error) {
    throw error;
  }
}

async function borrarElementoCarrito(idCarrito) {
  try {
    const respuesta = await fetch(`${API_URL}/${idCarrito}`, {
      method: 'DELETE',
      mode: 'cors'
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }
  } catch (error) {
    throw error;
  }
}

async function actualizarCarrito() {
  mostrarEstadoCarrito('Actualizando carrito...');

  try {
    const carritos = await obtenerCarrito();
    pintarCarrito(carritos);
    mostrarEstadoCarrito(`Carrito actualizado a las ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    console.error(error);
    mostrarEstadoCarrito(`Error al actualizar (${error.message})`, true);
  }
}

function pintarCarrito(carritos) {
  const cuerpo = document.getElementById('cuerpo-carrito');

  if (!cuerpo) {
    return;
  }

  cuerpo.innerHTML = '';

  if (carritos.length === 0) {
    const fila = document.createElement('tr');
    const celda = document.createElement('td');
    celda.colSpan = 4;
    celda.textContent = 'Tu carrito está vacío';
    fila.appendChild(celda);
    cuerpo.appendChild(fila);

    actualizarTotales(0, 0);
    return;
  }

  let subtotal = 0;

  carritos.forEach((item) => {
    subtotal += Number(item.precioFinal);

    const fila = document.createElement('tr');

    const celdaDescripcion = document.createElement('td');
    celdaDescripcion.textContent = item.descripcion;

    const celdaUnidades = document.createElement('td');
    celdaUnidades.textContent = item.unidades;

    const celdaPrecio = document.createElement('td');
    celdaPrecio.textContent = `${Number(item.precioFinal).toFixed(2)} €`;

    const celdaAccion = document.createElement('td');
    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.className = 'btn-eliminar';
    botonEliminar.dataset.idcarrito = item.idCarrito;

    botonEliminar.addEventListener('click', async () => {
      cambiarEstadoBoton(botonEliminar, true, 'Eliminando...');

      try {
        await borrarElementoCarrito(Number(botonEliminar.dataset.idcarrito));
        await actualizarCarrito();
      } catch (error) {
        console.error(error);
        mostrarEstadoCarrito(`Error al borrar (${error.message})`, true);
        cambiarEstadoBoton(botonEliminar, false, 'Eliminar');
      }
    });

    celdaAccion.appendChild(botonEliminar);

    fila.appendChild(celdaDescripcion);
    fila.appendChild(celdaUnidades);
    fila.appendChild(celdaPrecio);
    fila.appendChild(celdaAccion);

    cuerpo.appendChild(fila);
  });

  const envio = 5;
  actualizarTotales(subtotal, envio);
}

function actualizarTotales(subtotal, envio) {
  const subtotalElemento = document.getElementById('subtotal');
  const envioElemento = document.getElementById('envio');
  const totalElemento = document.getElementById('total');

  if (subtotalElemento) {
    subtotalElemento.textContent = `${subtotal.toFixed(2)} €`;
  }

  if (envioElemento) {
    envioElemento.textContent = `${envio.toFixed(2)} €`;
  }

  if (totalElemento) {
    totalElemento.textContent = `${(subtotal + envio).toFixed(2)} €`;
  }
}

function mostrarEstadoProductos(texto, esError = false) {
  const estado = document.getElementById('estado-productos');

  if (!estado) {
    return;
  }

  estado.textContent = texto;
  estado.style.color = esError ? 'crimson' : '#333';
}

function mostrarEstadoCarrito(texto, esError = false) {
  const estado = document.getElementById('estado-carrito');

  if (!estado) {
    return;
  }

  estado.textContent = texto;
  estado.style.color = esError ? 'crimson' : '#333';
}

function cambiarEstadoBoton(boton, deshabilitado, texto) {
  boton.disabled = deshabilitado;
  boton.textContent = texto;
}

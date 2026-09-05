const mesasContainer = document.getElementById("mesasContainer");

const mesasVacias = document.getElementById("mesasVacias");

const mesasOcupadas = document.getElementById("mesasOcupadas");

const connectionStatus =
    document.getElementById("connectionStatus");

const notification =
    document.getElementById("notification");


// =====================================
// CARGAR MESAS
// =====================================

async function cargarMesas() {

    try {

        const response = await fetch("/api/mesas");

        if (!response.ok) {
            throw new Error("Error en la API");
        }

        const mesas = await response.json();

        connectionStatus.textContent = "🟢 PostgreSQL conectado";

        mostrarMesas(mesas);

    } catch (error) {

        console.error(error);

        connectionStatus.textContent =
            "🔴 Error de conexión";

        mesasContainer.innerHTML = `
            <p>
                No se pudieron cargar las mesas.
                Verifica que PostgreSQL y el servidor estén funcionando.
            </p>
        `;
    }
}


// =====================================
// MOSTRAR MESAS
// =====================================

function mostrarMesas(mesas) {

    mesasContainer.innerHTML = "";

    let vacias = 0;
    let ocupadas = 0;

    mesas.forEach(mesa => {

        if (mesa.estado === "vacia") {
            vacias++;
        } else {
            ocupadas++;
        }

        const div = document.createElement("div");

        div.className = `mesa ${mesa.estado}`;

        const estadoTexto =
            mesa.estado === "vacia"
                ? "🟢 VACÍA"
                : "🔴 OCUPADA";

        const botonTexto =
            mesa.estado === "vacia"
                ? "Ocupar mesa"
                : "Liberar mesa";

        const nuevoEstado =
            mesa.estado === "vacia"
                ? "ocupada"
                : "vacia";

        const claseBoton =
            mesa.estado === "vacia"
                ? "btn-ocupar"
                : "btn-liberar";

        div.innerHTML = `
            <h3>Mesa ${mesa.numero}</h3>

            <div class="estado">
                ${estadoTexto}
            </div>

            <button
                class="btn ${claseBoton}"
                onclick="cambiarEstado(${mesa.id}, '${nuevoEstado}')">

                ${botonTexto}

            </button>
        `;

        mesasContainer.appendChild(div);

    });

    mesasVacias.textContent = vacias;

    mesasOcupadas.textContent = ocupadas;
}


// =====================================
// CAMBIAR ESTADO
// =====================================

async function cambiarEstado(id, estado) {

    const confirmacion = confirm(
        estado === "ocupada"
            ? "¿Deseas marcar esta mesa como ocupada?"
            : "¿Deseas liberar esta mesa?"
    );

    if (!confirmacion) {
        return;
    }

    try {

        const response = await fetch(`/api/mesas/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                estado: estado
            })

        });

        if (!response.ok) {
            throw new Error("No se pudo actualizar");
        }

        const mesa = await response.json();

        mostrarNotificacion(
            `Mesa ${mesa.numero} actualizada correctamente`
        );

        cargarMesas();

    } catch (error) {

        console.error(error);

        mostrarNotificacion(
            "❌ No se pudo actualizar la mesa"
        );
    }
}


// =====================================
// NOTIFICACIÓN
// =====================================

function mostrarNotificacion(mensaje) {

    notification.textContent = mensaje;

    notification.classList.add("show");

    setTimeout(() => {

        notification.classList.remove("show");

    }, 3000);
}


// =====================================
// INICIAR
// =====================================

cargarMesas();
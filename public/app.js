const mesasContainer = document.getElementById("mesas");
const mesasVacias = document.getElementById("mesasVacias");
const mesasOcupadas = document.getElementById("mesasOcupadas");
const mensaje = document.getElementById("mensaje");

async function cargarMesas() {
    try {
        const respuesta = await fetch("/api/mesas");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las mesas");
        }

        const mesas = await respuesta.json();

        mostrarMesas(mesas);

    } catch (error) {
        console.error(error);
        mesasContainer.innerHTML = "Error al cargar las mesas.";
    }
}

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

        div.innerHTML = `
            <h3>Mesa ${mesa.numero}</h3>
            <p>Estado: <strong>${mesa.estado}</strong></p>

            <button onclick="cambiarEstado(${mesa.id}, '${mesa.estado}')">
                ${mesa.estado === "vacia" ? "Ocupar mesa" : "Liberar mesa"}
            </button>
        `;

        mesasContainer.appendChild(div);
    });

    mesasVacias.textContent = vacias;
    mesasOcupadas.textContent = ocupadas;
}

async function cambiarEstado(id, estadoActual) {

    const nuevoEstado =
        estadoActual === "vacia" ? "ocupada" : "vacia";

    const confirmar = confirm(
        `¿Quieres ${nuevoEstado === "ocupada" ? "ocupar" : "liberar"} esta mesa?`
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(`/api/mesas/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                estado: nuevoEstado
            })
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo actualizar la mesa");
        }

        mostrarMensaje(
            `Mesa actualizada correctamente: ${nuevoEstado}`
        );

        cargarMesas();

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "Ocurrió un error al actualizar la mesa."
        );
    }
}

function mostrarMensaje(texto) {

    mensaje.textContent = texto;

    setTimeout(() => {
        mensaje.textContent = "";
    }, 3000);
}

cargarMesas();
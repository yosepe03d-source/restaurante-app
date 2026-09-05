const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Probar conexión con PostgreSQL
app.get("/api/test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            mensaje: "Conexión con PostgreSQL correcta",
            fecha: result.rows[0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "No se pudo conectar con PostgreSQL"
        });
    }
});

// Obtener todas las mesas
app.get("/api/mesas", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM mesas ORDER BY numero"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al obtener las mesas"
        });
    }
});

// Cambiar estado de una mesa
app.put("/api/mesas/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["vacia", "ocupada"].includes(estado)) {
        return res.status(400).json({
            error: "Estado no válido"
        });
    }

    try {
        const result = await pool.query(
            "UPDATE mesas SET estado = $1 WHERE id = $2 RETURNING *",
            [estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Mesa no encontrada"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al actualizar la mesa"
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
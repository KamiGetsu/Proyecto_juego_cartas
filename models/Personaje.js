const db = require('../config/database');

class Personaje {
    static async getAllPredefined() {
        const connection = await db(); // 👈 Asegúrate de ejecutar la función
        try {
            const [rows] = await connection.query(
                `SELECT p.*, r.nombre AS nombre_raza, t.nombre AS nombre_tipo
                 FROM Personajes p
                 JOIN razas r ON p.id_raza = r.id_raza
                 JOIN tipos_guerrero t ON p.id_tipo = t.id_tipo
                 WHERE p.id_jugador IS NULL`
            );
            return rows;
        } catch (error) {
            console.error('Error al obtener personajes predefinidos:', error);
            throw error;
        } finally {
            await connection.end(); // 👈 Cierra la conexión después de usarla
        }
    }

    static async findById(id_personaje) {
        const connection = await db(); // 👈 Asegúrate de ejecutar la función
        try {
            const [rows] = await connection.query(
                `SELECT * FROM Personajes WHERE id_personaje = ?`,
                [id_personaje]
            );
            if (!rows[0]) {
                throw new Error(`Personaje con ID ${id_personaje} no encontrado`);
            }
            return rows[0];
        } catch (error) {
            console.error('Error al buscar personaje por ID:', error);
            throw error;
        } finally {
            await connection.end(); // 👈 Cierra la conexión después de usarla
        }
    }
}

module.exports = Personaje;

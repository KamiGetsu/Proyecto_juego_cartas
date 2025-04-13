const connectDB = require('../config/database'); // Importa la función connectDB desde db.js

class Partida {
    static async create(id_jugador1) {
        try {
            const db = await connectDB();
            const [result] = await db.execute(
                'INSERT INTO partidas (id_jugador1) VALUES (?)',
                [id_jugador1]
            );
            await db.end(); // Cerrar la conexión
            return result.insertId; // Devuelve el ID de la partida recién creada
        } catch (error) {
            console.error("Error al crear la partida:", error);
            throw error;
        }
    }

    static async findById(id_partida) {
        try {
            const db = await connectDB();
            const [rows] = await db.execute(
                'SELECT * FROM partidas WHERE id_partida = ?',
                [id_partida]
            );
            await db.end(); // Cerrar la conexión
            return rows[0]; // Devuelve la partida encontrada o undefined si no existe
        } catch (error) {
            console.error("Error al buscar la partida:", error);
            throw error;
        }
    }

    static async getPartidasActivas() {
        try {
            const db = await connectDB();
            const [rows] = await db.execute(
                'SELECT * FROM partidas WHERE ganador IS NULL'
            );
            await db.end(); // Cerrar la conexión
            return rows; // Devuelve las partidas activas
        } catch (error) {
            console.error("Error al obtener las partidas activas:", error);
            throw error;
        }
    }

    static async partidaExiste(id_partida) {
        try {
            const db = await connectDB();
            const [rows] = await db.execute(
                'SELECT COUNT(*) AS count FROM partidas WHERE id_partida = ?',
                [id_partida]
            );
            await db.end(); // Cerrar la conexión
            return rows[0].count > 0; // Devuelve true si la partida existe
        } catch (error) {
            console.error("Error al verificar la existencia de la partida:", error);
            throw error;
        }
    }

    static async eliminarPartida(id_partida) {
        try {
            const db = await connectDB();

            // Eliminar la partida específica
            const [result] = await db.execute('DELETE FROM partidas WHERE id_partida = ?', [id_partida]);

            if (result.affectedRows === 0) {
                throw new Error("No se encontró la partida para eliminar");
            }

            // Verificar si quedan partidas en la tabla
            const [rows] = await db.execute('SELECT COUNT(*) AS total FROM partidas');

            // Si la tabla está vacía, resetear AUTO_INCREMENT
            if (rows[0].total === 0) {
                await db.execute('ALTER TABLE partidas AUTO_INCREMENT = 1');
                console.log("AUTO_INCREMENT reseteado a 1.");
            }

            await db.end(); // Cerrar la conexión
        } catch (error) {
            console.error("Error al eliminar la partida:", error);
            throw error;
        }
    }

    static async update(id_partida, updates) {
        try {
            const db = await connectDB();

            // Construcción dinámica de la consulta SQL
            const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
            const values = Object.values(updates);

            // Agregar el id_partida al final de los valores
            values.push(id_partida);

            const query = `UPDATE partidas SET ${fields} WHERE id_partida = ?`;
            const [result] = await db.execute(query, values);

            await db.end();
            return result.affectedRows > 0; // Devuelve true si la actualización fue exitosa
        } catch (error) {
            console.error("Error al actualizar la partida:", error);
            throw error;
        }
    }

    static async unirseAPartida(id_partida, id_jugador2) {
        try {
            const db = await connectDB();

            // Verificar si la partida existe
            const [rows] = await db.execute('SELECT * FROM partidas WHERE id_partida = ?', [id_partida]);
            if (rows.length === 0) {
                throw new Error("La partida no existe");
            }

            const partida = rows[0];

            // Verificar si ya hay un jugador 2 asignado
            if (partida.id_jugador2) {
                throw new Error("La partida ya está completa");
            }

            // Asignar al jugador actual como jugador 2
            await db.execute(
                'UPDATE partidas SET id_jugador2 = ? WHERE id_partida = ?',
                [id_jugador2, id_partida]
            );

            await db.end();
            return true;
        } catch (error) {
            console.error("Error al unirse a la partida:", error);
            throw error;
        }
    }

    // Nuevo método para actualizar el ganador de una partida
    static async actualizarGanador(id_partida, ganador) {
        try {
            const db = await connectDB();

            // Verificar si la partida existe
            const [rows] = await db.execute('SELECT * FROM partidas WHERE id_partida = ?', [id_partida]);
            if (rows.length === 0) {
                throw new Error("La partida no existe");
            }

            // Actualizar el campo "ganador" y cambiar el estado de la partida a "finalizada"
            await db.execute(
                'UPDATE partidas SET ganador = ?, status = ? WHERE id_partida = ?',
                [ganador, 'finalizada', id_partida]
            );

            await db.end();
            return true;
        } catch (error) {
            console.error("Error al actualizar el ganador de la partida:", error);
            throw error;
        }
    }
}

module.exports = Partida;
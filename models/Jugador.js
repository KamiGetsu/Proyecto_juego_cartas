const connectDB = require('../config/database.js');
const bcrypt = require('bcrypt');

class Jugador {
    static async create(nombre_usuario, contrasena) {
        const db = await connectDB();
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const [result] = await db.execute(
            'INSERT INTO jugadores (nombre_usuario, contrasena) VALUES (?, ?)',
            [nombre_usuario, hashedPassword]
        );
        return result.insertId;
    }

    static async findByNombreUsuario(nombre_usuario) {
        const db = await connectDB();
        const [rows] = await db.execute('SELECT * FROM jugadores WHERE nombre_usuario = ?', [nombre_usuario]);
        return rows[0];
    }

    static async getAll() {
        const db = await connectDB();
        const [rows] = await db.execute('SELECT id_jugador, nombre_usuario FROM jugadores');
        return rows;
    }

    static async findById(id_jugador) {
        const db = await connectDB();
        const [rows] = await db.execute('SELECT id_jugador, nombre_usuario FROM jugadores WHERE id_jugador = ?', [id_jugador]);
        return rows[0] || null;
    }
}

module.exports = Jugador;

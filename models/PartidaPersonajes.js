const connectDB = require('../config/database.js');

class PartidaPersonajes {
    static async create({ id_partida, id_jugador, id_personaje }) {
        const db = await connectDB();
        const [result] = await db.execute(
            'INSERT INTO partida_personajes (id_partida, id_jugador, id_personaje) VALUES (?, ?, ?)',
            [id_partida, id_jugador, id_personaje]
        );
        return result.insertId;
    }
}

module.exports = PartidaPersonajes;
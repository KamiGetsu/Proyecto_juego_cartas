const Partida = require('../models/Partida.js');
const connectDB = require('../config/database.js');

// Obtener las partidas del jugador (como jugador 1 o jugador 2)
const play = async (req, res) => {
    if (!req.session.id_jugador) {
        return res.status(401).json({ error: 'No autorizado. Inicia sesión para continuar.' });
    }

    try {
        const db = await connectDB();
        const [partidas] = await db.execute(
            `SELECT * FROM partidas 
            WHERE id_jugador1 = ? OR id_jugador2 = ?`,
            [req.session.id_jugador, req.session.id_jugador]
        );

    
        res.json(partidas);
    } catch (error) {
        console.error('Error al obtener las partidas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { play };
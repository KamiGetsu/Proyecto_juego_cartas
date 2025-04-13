const path = require('path');
const Personaje = require('../models/Personaje');

// Vista para seleccionar personajes
exports.view = async (req, res) => {
    if (!req.session.id_jugador) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public/views/partidas/select.html'));
};

// Obtener todos los personajes predefinidos
exports.getPersonajes = async (req, res) => {
    try {
        const personajes = await Personaje.getAllPredefined();
        res.json(personajes);
    } catch (error) {
        console.error('Error al obtener los personajes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Comparar estadísticas de los personajes seleccionados
exports.compararEstadisticas = async (req, res) => {
    const { jugador1, jugador2 } = req.body;

    if (!Array.isArray(jugador1) || !Array.isArray(jugador2) || jugador1.length !== 5 || jugador2.length !== 5) {
        return res.status(400).json({ error: 'Ambos jugadores deben seleccionar exactamente 5 cartas.' });
    }

    try {
        // Obtener las estadísticas de ambos jugadores
        const statsJugador1 = await calcularEstadisticas(jugador1);
        const statsJugador2 = await calcularEstadisticas(jugador2);

        // Determinar el ganador
        let ganador = statsJugador1 > statsJugador2 ? 'Jugador 1' :
                      statsJugador2 > statsJugador1 ? 'Jugador 2' : 'Empate';

        res.json({ statsJugador1, statsJugador2, ganador });
    } catch (error) {
        console.error('Error al comparar estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Función auxiliar para calcular estadísticas
async function calcularEstadisticas(ids) {
    try {
        const personajes = await Promise.all(ids.map(async id => {
            try {
                return await Personaje.findById(id);
            } catch {
                return null; // Si un personaje no existe, lo ignoramos
            }
        }));

        return personajes
            .filter(p => p !== null) // Eliminar personajes no encontrados
            .reduce((total, p) => total + (p.poder || 0) + (p.vida || 0) + (p.magia || 0), 0);
    } catch (error) {
        console.error('Error al calcular estadísticas:', error);
        throw error;
    }
}

// Obtener detalles de un personaje específico
exports.getPersonajeById = async (req, res) => {
    const { id } = req.params;

    try {
        const personaje = await Personaje.findById(id);

        if (!personaje) {
            return res.status(404).json({ error: 'Personaje no encontrado' });
        }

        res.json(personaje);
    } catch (error) {
        console.error('Error al obtener el personaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

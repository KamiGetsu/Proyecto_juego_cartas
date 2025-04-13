const Partida = require('../models/Partida');

// Crear una nueva partida
exports.create = async (req, res) => {
    try {
        if (!req.session.id_jugador) {
            return res.status(401).json({ error: 'Debes iniciar sesión para crear una partida' });
        }

        const id_jugador1 = req.session.id_jugador;
        const id_partida = await Partida.create(id_jugador1);

        res.status(201).json({
            message: 'Partida creada exitosamente',
            id_partida,
            redirect: `/select/`
        });
    } catch (error) {
        console.error("Error al crear la partida:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Unirse a una partida existente
exports.join = async (req, res) => {
    try {
        if (!req.session.id_jugador) {
            return res.status(401).json({ error: 'Debes iniciar sesión para unirte a una partida' });
        }

        const { id_partida } = req.params;
        const id_jugador = req.session.id_jugador;

        const partida = await Partida.findById(id_partida);
        if (!partida) {
            return res.status(404).json({ error: 'Partida no encontrada' });
        }

        if (partida.id_jugador2) {
            return res.status(400).json({ error: 'La partida ya está llena' });
        }

        if (partida.id_jugador1 === id_jugador) {
            return res.status(400).json({ error: 'No puedes unirte a tu propia partida' });
        }

        await Partida.update(id_partida, { id_jugador2: id_jugador });
        res.status(200).json({
            message: 'Te has unido a la partida exitosamente',
            redirect: `/select/`
        });
    } catch (error) {
        console.error("Error al unirse a la partida:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener una partida específica
exports.getPartida = async (req, res) => {
    try {
        const { id_partida } = req.params;
        const partida = await Partida.findById(id_partida);

        if (!partida) {
            return res.status(404).json({ error: 'Partida no encontrada' });
        }

        res.status(200).json(partida);
    } catch (error) {
        console.error("Error al obtener la partida:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener todas las partidas activas
exports.getPartidasActivas = async (req, res) => {
    try {
        const partidas = await Partida.getPartidasActivas();
        res.status(200).json(partidas);
    } catch (error) {
        console.error("Error al obtener las partidas activas:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Eliminar una partida
exports.delete = async (req, res) => {
    try {
        const { id_partida } = req.params;

        // Verificar si la partida existe antes de eliminarla
        const partidaExiste = await Partida.partidaExiste(id_partida);
        if (!partidaExiste) {
            return res.status(404).json({ error: 'Partida no encontrada' });
        }

        await Partida.eliminarPartida(id_partida);
        res.status(200).json({ message: `Partida ${id_partida} eliminada exitosamente` });
    } catch (error) {
        console.error("Error al eliminar la partida:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Guardar el resultado de la partida (quién ganó)
exports.updateResultado = async (req, res) => {
    try {
        const { id_partida } = req.params;
        const { ganador } = req.body;

        if (!ganador) {
            return res.status(400).json({ error: 'El campo "ganador" es obligatorio' });
        }

        // Verificar si la partida existe
        const partidaExiste = await Partida.partidaExiste(id_partida);
        if (!partidaExiste) {
            return res.status(404).json({ error: 'Partida no encontrada' });
        }

        // Actualizar el campo "ganador" en la tabla PARTIDAS
        await Partida.actualizarGanador(id_partida, ganador);

        res.status(200).json({ message: 'Resultado de la partida actualizado correctamente' });
    } catch (error) {
        console.error("Error al actualizar el resultado de la partida:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
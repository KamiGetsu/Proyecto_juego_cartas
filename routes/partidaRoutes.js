const express = require('express');
const router = express.Router();
const partidaController = require('../controllers/partidaController');

// Crear una nueva partida
router.post('/api/partida', partidaController.create);

// Unirse a una partida existente
router.post('/api/partida/:id_partida/join', partidaController.join);

// Obtener todas las partidas activas
router.get('/api/partidas', partidaController.getPartidasActivas);

// Obtener una partida específica
router.get('/api/partida/:id_partida', partidaController.getPartida);

// Eliminar una partida
router.delete('/api/partida/:id_partida', partidaController.delete);

// Guardar el resultado de la partida (quién ganó)
router.post('/api/partida/:id_partida/resultado', partidaController.updateResultado);

module.exports = router;
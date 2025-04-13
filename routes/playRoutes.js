const express = require('express');
const router = express.Router();
const { play } = require('../controllers/playController.js');
const authMiddleware = require('../middlewares/authMiddleware');
const path = require('path');

// Ruta protegida: Sirve el archivo HTML si hay una sesión activa
router.get('/play', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/play/play.html'));
});

// Ruta para obtener datos del juego (partidas activas)
router.get('/api/play', authMiddleware, play);

module.exports = router;
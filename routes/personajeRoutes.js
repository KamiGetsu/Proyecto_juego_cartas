const express = require('express');
const router = express.Router();
const personajeController = require('../controllers/personajeController');

// Definir las rutas y asignarlas a los métodos del controlador
router.get('/personajes/view', personajeController.view); // Vista para seleccionar personajes
router.get('/api/personajes', personajeController.getPersonajes); // Obtener todos los personajes
router.post('/api/comparar-estadisticas', personajeController.compararEstadisticas); // Comparar estadísticas
router.get('/api/personaje/:id', personajeController.getPersonajeById); // Obtener detalles de un personaje

module.exports = router;
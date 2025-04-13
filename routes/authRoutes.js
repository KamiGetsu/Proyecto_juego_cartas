const express = require('express');
const router = express.Router();
const { register, login, logout, checkSession, getAllJugadores, getJugadorById, deleteJugadorById, updateJugadorById } 
 = require('../controllers/authController.js');

// Rutas de autenticación
router.route('/register').get(register).post(register);
router.route('/login').get(login).post(login);
router.get('/logout', logout);
router.get('/api/check-session', checkSession);

// Rutas de jugadores
router.get('/jugadores', getAllJugadores);
router.get('/jugadores/:id', getJugadorById);
router.delete('/jugadores/:id', deleteJugadorById); 
router.put('/jugadores/:id', updateJugadorById);

module.exports = router;

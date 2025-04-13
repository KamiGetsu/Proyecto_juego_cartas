const path = require('path');
const connectDB = require('../config/database.js');
const Jugador = require('../models/Jugador.js');
const bcrypt = require('bcrypt');

const rootDir = path.resolve(__dirname, '..');

// Método para registrar un nuevo jugador
const register = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const { nombre_usuario, contrasena } = req.body;
            if (!nombre_usuario || !contrasena) {
                return res.status(400).json({ error: 'Nombre de usuario y contraseña son requeridos' });
            }

            const existingUser = await Jugador.findByNombreUsuario(nombre_usuario);
            if (existingUser) {
                return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
            }

            const id = await Jugador.create(nombre_usuario, contrasena);
            if (!id) {
                return res.status(500).json({ error: 'Error al registrar el usuario' });
            }

            const newUser = { id_jugador: id, nombre_usuario };
            
            if (req.headers.accept && req.headers.accept.includes('text/html')) {
                return res.redirect('/views/auth/autth.html');
            }

            return res.status(201).json(newUser);
        } catch (error) {
            console.error('Error en el registro:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    
    const authPath = path.join(rootDir, 'views', 'auth', 'autth.html');
    return res.sendFile(authPath);
};

// Método para iniciar sesión
const login = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const { nombre_usuario, contrasena } = req.body;
            if (!nombre_usuario || !contrasena) {
                return res.status(400).json({ error: 'Nombre de usuario y contraseña son requeridos' });
            }

            const jugador = await Jugador.findByNombreUsuario(nombre_usuario);
            if (!jugador || !(await bcrypt.compare(contrasena, jugador.contrasena))) {
                if (req.headers.accept && req.headers.accept.includes('text/html')) {
                    return res.redirect('/views/auth/autth.html?error=Usuario%20o%20contraseña%20incorrectos');
                }
                return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
            }

            req.session.id_jugador = jugador.id_jugador;
            req.session.nombre_usuario = jugador.nombre_usuario;

            if (req.headers.accept && req.headers.accept.includes('text/html')) {
                return res.redirect('/views/play/play.html');
            }

            return res.json({ id_jugador: jugador.id_jugador, nombre_usuario: jugador.nombre_usuario });

        } catch (error) {
            console.error('Error en el login:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    
    const authPath = path.join(rootDir, 'views', 'auth', 'autth.html');
    return res.sendFile(authPath);
};

// Método para cerrar sesión
const logout = (req, res) => {
    req.session.destroy(() => {
        return res.redirect('/views/auth/autth.html');
    });
};

// Método para verificar la sesión
const checkSession = (req, res) => {
    return res.json({ isLoggedIn: !!req.session.id_jugador, usuario: req.session.nombre_usuario || null });
};

// Método para obtener todos los jugadores
const getAllJugadores = async (req, res) => {
    try {
        const jugadores = await Jugador.getAll();
        return res.json(jugadores);
    } catch (error) {
        console.error('Error al obtener los jugadores:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Método para obtener un jugador por ID
const getJugadorById = async (req, res) => {
    try {
        const { id } = req.params;
        const jugador = await Jugador.findById(id);

        if (!jugador) {
            return res.status(404).json({ error: 'Jugador no encontrado' });
        }

        return res.json(jugador);
    } catch (error) {
        console.error('Error al obtener el jugador:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Método para eliminar un jugador por ID
const deleteJugadorById = async (req, res) => {
    try {
        const { id } = req.params;
        const jugador = await Jugador.findById(id);

        if (!jugador) {
            return res.status(404).json({ error: 'Jugador no encontrado' });
        }

        const db = await connectDB(); // Conexión a la base de datos
        await db.execute('DELETE FROM jugadores WHERE id_jugador = ?', [id]);

        return res.json({ message: 'Jugador eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el jugador:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Método para actualizar un jugador por ID
const updateJugadorById = async (req, res) => {
    try {
        const { id } = req.params; // Obtenemos el ID del jugador desde los parámetros de la URL
        const { nombre_usuario, contrasena } = req.body; // Obtenemos los datos a actualizar del cuerpo de la solicitud

        // Validamos que se proporcionen los datos necesarios
        if (!nombre_usuario && !contrasena) {
            return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar (nombre_usuario o contrasena)' });
        }

        // Verificamos si el jugador existe
        const jugador = await Jugador.findById(id);
        if (!jugador) {
            return res.status(404).json({ error: 'Jugador no encontrado' });
        }

        // Si se proporciona un nuevo nombre de usuario, verificamos que no esté en uso
        if (nombre_usuario) {
            const existingUser = await Jugador.findByNombreUsuario(nombre_usuario);
            if (existingUser && existingUser.id_jugador !== parseInt(id)) {
                return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
            }
        }

        // Actualizamos los datos del jugador
        const updatedData = {};
        if (nombre_usuario) updatedData.nombre_usuario = nombre_usuario;
        if (contrasena) updatedData.contrasena = await bcrypt.hash(contrasena, 10); // Encriptamos la nueva contraseña

        const db = await connectDB(); // Conexión a la base de datos
        const query = `
            UPDATE jugadores 
            SET ${Object.keys(updatedData).map((key, index) => `${key} = ?`).join(', ')} 
            WHERE id_jugador = ?
        `;
        const values = [...Object.values(updatedData), id];

        await db.execute(query, values);

        // Retornamos el jugador actualizado
        const updatedJugador = await Jugador.findById(id);
        return res.json(updatedJugador);
    } catch (error) {
        console.error('Error al actualizar el jugador:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};


module.exports = { register, login, logout, checkSession, getAllJugadores, getJugadorById, deleteJugadorById, updateJugadorById};
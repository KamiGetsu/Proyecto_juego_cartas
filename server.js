const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/database'); // Importar la conexión a la base de datos
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const personajeRoutes = require('./routes/personajeRoutes');
const partidaRoutes = require('./routes/partidaRoutes');
const playRoutes = require('./routes/playRoutes');
const Partida = require('./models/Partida'); // Importar modelo de Partida

// Inicializar la aplicación Express
const app = express();

// Configurar el puerto
const PORT = process.env.PORT || 3000;

// Middleware para parsear datos de formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'tu_secreto_aqui',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true en producción
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Middleware de autenticación
const isAuthenticated = (req, res, next) => {
    if (req.session.id_jugador) {
        return next();
    }
    res.redirect('/');
};

// Ruta página de inicio
app.get('/', (req, res) => {
    if (req.session.id_jugador) {
        res.redirect('/play');
    } else {
        res.sendFile(path.join(__dirname, 'public/views/auth/autth.html'));
    }
});

// Ruta para el área de juego
app.get('/play', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/play/play.html'));
});

// Ruta para servir la página de selección de personajes
app.get('/select', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/partidas/select.html'));
});

// API para verificar si el jugador está logueado
app.get('/api/check-login', (req, res) => {
    if (req.session.id_jugador) {
        res.json({ loggedIn: true, playerName: req.session.nombre_jugador }); // Suponiendo que guardas el nombre del jugador en la sesión
    } else {
        res.json({ loggedIn: false });
    }
});

// Crear una nueva partida
app.post('/api/crearPartida', async (req, res) => {
    try {
        const id_jugador1 = req.session.id_jugador;
        const id_partida = await Partida.create(id_jugador1);

        // Enviar la redirección como JSON para manejarla en el frontend
        res.json({ redirect: '/select/' });
    } catch (error) {
        console.error('Error al crear la partida:', error);
        res.status(500).json({ error: 'No se pudo crear la partida' });
    }
});

// Eliminar una partida
app.delete('/api/partida/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const db = await connectDB(); // Obtener la conexión a la base de datos

        // Verificar si la partida existe en la base de datos
        const [rows] = await db.execute('SELECT id_partida FROM partidas WHERE id_partida = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Partida no encontrada' });
        }

        // Eliminar la partida de la base de datos
        await db.execute('DELETE FROM partidas WHERE id_partida = ?', [id]);
        await db.end();

        res.status(200).json({ message: 'Partida eliminada' });
    } catch (error) {
        console.error('Error al eliminar la partida:', error.message);
        res.status(500).json({ error: 'Error interno al eliminar la partida' });
    }
});

// Usar las rutas
app.use(authRoutes);
app.use(personajeRoutes);
app.use(partidaRoutes);
app.use(playRoutes);

// Manejador de errores 404
app.use((req, res, next) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'public/views/errors/404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: 'Recurso no encontrado' });
    } else {
        res.type('txt').send('Recurso no encontrado');
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
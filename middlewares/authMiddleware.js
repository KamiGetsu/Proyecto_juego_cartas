const authMiddleware = (req, res, next) => {
    // Verificar si el usuario tiene una sesión activa
    if (!req.session.id_jugador) {
        return res.status(401).json({ error: 'Debes iniciar sesión para acceder a esta página' });
    }

    // Si la sesión está activa, continuar con la ruta
    next();
};

module.exports = authMiddleware;
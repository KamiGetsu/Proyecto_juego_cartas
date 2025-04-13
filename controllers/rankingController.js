// Obtener el ranking de jugadores
exports.obtenerRanking = async (req, res) => {
    try {
        const db = await connectDB();

        // Consulta para obtener el ranking ordenado por victorias
        const [rows] = await db.execute(`
            SELECT j.nombre_usuario, e.victorias, e.derrotas
            FROM estadisticas_jugadores e
            JOIN jugadores j ON e.id_jugador = j.id_jugador
            ORDER BY e.victorias DESC
        `);

        await db.end();
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el ranking" });
    }
};
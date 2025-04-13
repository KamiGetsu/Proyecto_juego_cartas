const connectDB = require('../config/database.js');

class TipoGuerrero {
    static async getAll() {
        let db;
        try {
            db = await connectDB();
            const [rows] = await db.execute('SELECT * FROM tipos_guerrero');
            return rows;
        } catch (error) {
            console.error('Error al obtener los tipos de guerrero:', error);
            throw error;
        } finally {
            if (db) await db.end();
        }
    }
}

module.exports = TipoGuerrero;
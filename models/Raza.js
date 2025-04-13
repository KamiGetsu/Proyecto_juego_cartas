const connectDB = require('../config/database.js');

class Raza {
    static async getAll() {
        let db;
        try {
            db = await connectDB();
            const [rows] = await db.execute('SELECT * FROM razas');
            return rows;
        } catch (error) {
            console.error('Error al obtener las razas:', error);
            throw error;
        } finally {
            if (db) await db.end();
        }
    }
}

module.exports = Raza;
const connectDB = require('../config/database.js');

class RazaTipoGuerrero {
    static async validate(id_raza, id_tipo) {
        const db = await connectDB();
        const [rows] = await db.execute(
            'SELECT * FROM raza_tipo_guerrero WHERE id_raza = ? AND id_tipo = ?',
            [id_raza, id_tipo]
        );
        return rows.length > 0;
    }
}

module.exports = RazaTipoGuerrero;
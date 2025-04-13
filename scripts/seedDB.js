const connectDB = require('../config/database');
const Raza = require('../models/Raza');

const seedDB = async () => {
    const db = await connectDB();

    try {
        console.log('Iniciando inserción de datos iniciales...');

        // 1. Insertar Razas
        const razas = [
            ['Altmer'], ['Argoniano'], ['Bosmer'], ['Bretón'], ['Dunmer'],
            ['Imperial'], ['Khajiita'], ['Nórdico'], ['Orco'], ['Guardia Rojo']
        ];
        await db.query('INSERT INTO razas (nombre) VALUES ?', [razas]);
        console.log('Razas insertadas correctamente.');

        // 2. Insertar Tipos de Guerrero
        const tipos = [
            ['Mago'], ['Guerrero'], ['Paladín'], ['Cazador'], ['Druida'],
            ['Brujo'], ['Chamán']
        ];
        await db.query('INSERT INTO tipos_guerrero (nombre) VALUES ?', [tipos]);
        console.log('Tipos de guerrero insertados correctamente.');

        // 3. Insertar Relaciones entre Razas y Tipos de Guerrero
        const relaciones = [
            [1, 1], [1, 6], [1, 5], // Altmer: Mago, Brujo, Druida
            [2, 7], [2, 4], [2, 5], // Argoniano: Chamán, Cazador, Druida
            [3, 4], [3, 2], [3, 7], // Bosmer: Cazador, Guerrero, Chamán
            [4, 1], [4, 3], [4, 6], // Bretón: Mago, Paladín, Brujo
            [5, 6], [5, 1], [5, 2], // Dunmer: Brujo, Mago, Guerrero
            [6, 3], [6, 2], [6, 1], // Imperial: Paladín, Guerrero, Mago
            [7, 4], [7, 7], [7, 2], // Khajiita: Cazador, Chamán, Guerrero
            [8, 2], [8, 3], [8, 7], // Nórdico: Guerrero, Paladín, Chamán
            [9, 2], [9, 3], [9, 4], // Orco: Guerrero, Paladín, Cazador
            [10, 2], [10, 4], [10, 7] // Guardia Rojo: Guerrero, Cazador, Chamán
        ];
        await db.query('INSERT INTO raza_tipo_guerrero (id_raza, id_tipo) VALUES ?', [relaciones]);
        console.log('Relaciones entre razas y tipos de guerrero insertadas correctamente.');

        // 4. Insertar Estadísticas Base para cada combinación de Raza y Tipo de Guerrero
        const estadisticasBase = [
            // Altmer: Mago, Brujo, Druida
            [1, 1, 80, 60, 90], // Altmer Mago: Alto poder y magia, baja vida
            [1, 6, 70, 65, 85], // Altmer Brujo
            [1, 5, 60, 70, 80], // Altmer Druida

            // Argoniano: Chamán, Cazador, Druida
            [2, 7, 50, 80, 70], // Argoniano Chamán
            [2, 4, 65, 75, 60], // Argoniano Cazador
            [2, 5, 55, 85, 65], // Argoniano Druida

            // Bosmer: Cazador, Guerrero, Chamán
            [3, 4, 70, 70, 60], // Bosmer Cazador
            [3, 2, 75, 80, 50], // Bosmer Guerrero
            [3, 7, 60, 75, 65], // Bosmer Chamán

            // Bretón: Mago, Paladín, Brujo
            [4, 1, 75, 65, 85], // Bretón Mago
            [4, 3, 65, 80, 70], // Bretón Paladín
            [4, 6, 70, 70, 80], // Bretón Brujo

            // Dunmer: Brujo, Mago, Guerrero
            [5, 6, 70, 70, 80], // Dunmer Brujo
            [5, 1, 75, 65, 85], // Dunmer Mago
            [5, 2, 80, 75, 60], // Dunmer Guerrero

            // Imperial: Paladín, Guerrero, Mago
            [6, 3, 70, 85, 65], // Imperial Paladín
            [6, 2, 80, 80, 60], // Imperial Guerrero
            [6, 1, 65, 70, 80], // Imperial Mago

            // Khajiita: Cazador, Chamán, Guerrero
            [7, 4, 75, 70, 60], // Khajiita Cazador
            [7, 7, 60, 75, 70], // Khajiita Chamán
            [7, 2, 80, 80, 55], // Khajiita Guerrero

            // Nórdico: Guerrero, Paladín, Chamán
            [8, 2, 85, 80, 50], // Nórdico Guerrero
            [8, 3, 70, 85, 60], // Nórdico Paladín
            [8, 7, 60, 80, 65], // Nórdico Chamán

            // Orco: Guerrero, Paladín, Cazador
            [9, 2, 90, 85, 45], // Orco Guerrero
            [9, 3, 75, 90, 50], // Orco Paladín
            [9, 4, 80, 80, 55], // Orco Cazador

            // Guardia Rojo: Guerrero, Cazador, Chamán
            [10, 2, 85, 80, 50], // Guardia Rojo Guerrero
            [10, 4, 75, 75, 60], // Guardia Rojo Cazador
            [10, 7, 60, 80, 65]  // Guardia Rojo Chamán
        ];
        await db.query('INSERT INTO estadisticas_base (id_raza, id_tipo, poder, vida, magia) VALUES ?', [estadisticasBase]);
        console.log('Estadísticas base insertadas correctamente.');

        // 5. Insertar los 12 Guerreros Predefinidos
        const personajes = [
            // Nombre, id_raza, id_tipo, id_jugador (NULL), poder, vida, magia
            ['Eldrin', 1, 1, null, 80, 60, 90],   // Altmer Mago
            ['Sssarok', 2, 7, null, 50, 80, 70],  // Argoniano Chamán
            ['Lyris', 3, 4, null, 70, 70, 60],    // Bosmer Cazador
            ['Alaric', 4, 3, null, 65, 80, 70],   // Bretón Paladín
            ['Veyra', 5, 6, null, 70, 70, 80],    // Dunmer Brujo
            ['Cassian', 6, 2, null, 80, 80, 60],  // Imperial Guerrero
            ['Zara', 7, 4, null, 75, 70, 60],     // Khajiita Cazador
            ['Bjorn', 8, 2, null, 85, 80, 50],    // Nórdico Guerrero
            ['Gorzod', 9, 2, null, 90, 85, 45],   // Orco Guerrero
            ['Tazim', 10, 4, null, 75, 75, 60],   // Guardia Rojo Cazador
            ['Myrvana', 1, 5, null, 60, 70, 80],  // Altmer Druida
            ['Tharok', 9, 3, null, 75, 90, 50]    // Orco Paladín
        ];
        await db.query('INSERT INTO Personajes (nombre, id_raza, id_tipo, id_jugador, poder, vida, magia) VALUES ?', [personajes]);
        console.log('Guerreros predefinidos insertados correctamente.');

        console.log('Datos iniciales insertados exitosamente.');
    } catch (error) {
        console.error('Error al insertar datos iniciales:', error);
    } finally {
        await db.end();
        process.exit();
    }
};

seedDB().catch(err => {
    console.error('Error general en seedDB:', err);
    process.exit(1);
});
const connectDB = require('../config/database');

const updateDB = async () => {
    const db = await connectDB();

    try {
        console.log('Iniciando actualización de la base de datos...');

        // 1. Agregar una nueva columna a la tabla "jugadores"
        await db.execute(`
            ALTER TABLE jugadores
            ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE NULL
        `);
        console.log('Columna "fecha_nacimiento" agregada a la tabla "jugadores".');

        // 2. Modificar el tipo de dato de una columna existente
        await db.execute(`
            ALTER TABLE personajes
            MODIFY COLUMN poder INT NOT NULL DEFAULT 50
        `);
        console.log('Columna "poder" modificada en la tabla "personajes".');

        // 3. Crear una nueva tabla
        await db.execute(`
            CREATE TABLE IF NOT EXISTS estadisticas_jugador (
                id_estadistica INT PRIMARY KEY AUTO_INCREMENT,
                id_jugador INT NOT NULL,
                partidas_ganadas INT DEFAULT 0,
                partidas_perdidas INT DEFAULT 0,
                FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador) ON DELETE CASCADE
            )
        `);
        console.log('Tabla "estadisticas_jugador" creada o verificada.');

        // 4. Agregar una nueva raza a la tabla "razas"
        await db.execute(`
            INSERT INTO razas (nombre)
            VALUES ('Vampiro')
            ON DUPLICATE KEY UPDATE nombre=VALUES(nombre)
        `);
        console.log('Nueva raza "Vampiro" insertada en la tabla "razas".');

        // 5. Actualizar una relación entre tablas
        await db.execute(`
            ALTER TABLE partida_personajes
            ADD COLUMN IF NOT EXISTS posicion INT DEFAULT 0
        `);
        console.log('Columna "posicion" agregada a la tabla "partida_personajes".');

        console.log('Actualización de la base de datos completada.');
    } catch (error) {
        console.error('Error al actualizar la base de datos:', error);
    } finally {
        await db.end();
        process.exit();
    }
};

updateDB().catch(err => {
    console.error(err);
    process.exit(1);
});
const connectDB = require('../config/database.js');

const initDB = async () => {
    let db;
    try {
        console.log('Conectando a MySQL...');
        db = await connectDB();
        console.log('Conectado a MySQL.');

        console.log('Creando las tablas en la base de datos...');

        // 1. Crear la tabla Jugadores
        await db.query(`
            CREATE TABLE IF NOT EXISTS Jugadores (
                id_jugador INT AUTO_INCREMENT PRIMARY KEY,
                nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
                contrasena VARCHAR(255) NOT NULL
            )
        `);
        console.log('Tabla Jugadores creada.');

        // 2. Crear la tabla Razas
        await db.query(`
            CREATE TABLE IF NOT EXISTS razas (
                id_raza INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL UNIQUE
            )
        `);
        console.log('Tabla razas creada.');

        // 3. Crear la tabla Tipos de Guerrero
        await db.query(`
            CREATE TABLE IF NOT EXISTS tipos_guerrero (
                id_tipo INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL UNIQUE
            )
        `);
        console.log('Tabla tipos_guerrero creada.');

        // 4. Crear la tabla Raza_Tipo_Guerrero (relación entre razas y tipos de guerrero)
        await db.query(`
            CREATE TABLE IF NOT EXISTS raza_tipo_guerrero (
                id_raza INT,
                id_tipo INT,
                PRIMARY KEY (id_raza, id_tipo),
                FOREIGN KEY (id_raza) REFERENCES razas(id_raza),
                FOREIGN KEY (id_tipo) REFERENCES tipos_guerrero(id_tipo)
            )
        `);
        console.log('Tabla raza_tipo_guerrero creada.');

        // 5. Crear la tabla Estadisticas_Base
        await db.query(`
            CREATE TABLE IF NOT EXISTS estadisticas_base (
                id_raza INT,
                id_tipo INT,
                poder INT NOT NULL,
                vida INT NOT NULL,
                magia INT NOT NULL,
                PRIMARY KEY (id_raza, id_tipo),
                FOREIGN KEY (id_raza) REFERENCES razas(id_raza),
                FOREIGN KEY (id_tipo) REFERENCES tipos_guerrero(id_tipo)
            )
        `);
        console.log('Tabla estadisticas_base creada.');

        // 6. Crear la tabla Personajes
        await db.query(`
            CREATE TABLE IF NOT EXISTS Personajes (
                id_personaje INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                id_raza INT,
                id_tipo INT,
                id_jugador INT,
                poder INT NOT NULL,
                vida INT NOT NULL,
                magia INT NOT NULL,
                FOREIGN KEY (id_raza) REFERENCES razas(id_raza),
                FOREIGN KEY (id_tipo) REFERENCES tipos_guerrero(id_tipo),
                FOREIGN KEY (id_jugador) REFERENCES Jugadores(id_jugador)
            )
        `);
        console.log('Tabla Personajes creada.');

        // 7. Crear la tabla Partidas
        await db.query(`
            CREATE TABLE IF NOT EXISTS partidas (
                id_partida INT AUTO_INCREMENT PRIMARY KEY,
                id_jugador1 INT NOT NULL,
                id_jugador2 INT,
                ganador INT,
                status ENUM('waiting', 'in_progress', 'finished') DEFAULT 'waiting',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_jugador1) REFERENCES Jugadores(id_jugador),
                FOREIGN KEY (id_jugador2) REFERENCES Jugadores(id_jugador),
                FOREIGN KEY (ganador) REFERENCES Jugadores(id_jugador)
            )
        `);
        console.log('Tabla partidas creada.');

        // 8. Crear la tabla Partida_Personajes (relación entre partidas y personajes)
        await db.query(`
            CREATE TABLE IF NOT EXISTS partida_personajes (
            id_partida INT,
            id_jugador INT,
            id_personaje INT,
            PRIMARY KEY (id_partida, id_jugador, id_personaje),
            FOREIGN KEY (id_partida) REFERENCES partidas(id_partida) ON DELETE CASCADE,
            FOREIGN KEY (id_jugador) REFERENCES Jugadores(id_jugador) ON DELETE CASCADE,
            FOREIGN KEY (id_personaje) REFERENCES Personajes(id_personaje) ON DELETE CASCADE
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS jugadores_partida (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            game_id INT NOT NULL,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Jugadores(id_jugador) ON DELETE CASCADE,
            FOREIGN KEY (game_id) REFERENCES partidas(id_partida) ON DELETE CASCADE
            )
        `);
        console.log('Tabla partida_personajes creada.');

        console.log('Base de datos inicializada correctamente.');
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        throw error;
    } finally {
        if (db) {
            await db.end();
            console.log('Conexión a MySQL cerrada.');
        }
        process.exit();
    }
};

initDB().catch(err => {
    console.error('Error general en initDB:', err);
    process.exit(1);
});
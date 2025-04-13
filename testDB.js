const db = require('./config/database');

const testQuery = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM Personajes'); // O la tabla que quieras verificar
        console.log('Resultados:', rows);
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
    } finally {
        await db.end();
    }
};

testQuery();

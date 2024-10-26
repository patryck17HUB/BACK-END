const { Sequelize } = require('sequelize');

// Crear una instancia de Sequelize
const sequelize = new Sequelize('bdBanco', 'admin', 'Ohz5m0ngJAvz1M0qs66S', {
    host: 'la-mejor-bd-waos.czsoiskc2fm0.us-east-2.rds.amazonaws.com',
    dialect: 'mysql',
    pool: {
        max: 10,        // Número máximo de conexiones en el pool
        min: 0,         // Número mínimo de conexiones en el pool
        acquire: 30000, // Tiempo máximo, en milisegundos, que Sequelize intentará obtener una conexión antes de arrojar un error
        idle: 10000     // Tiempo máximo que una conexión puede estar inactiva antes de ser liberada
    },
    logging: false // Desactivar el registro de consultas SQL en la consola
});

// Probar la conexión
sequelize.authenticate()
.then(() => console.log('Conexión a la base de datos establecida correctamente.'))
.catch(err => console.error('Error al conectar con la base de datos:', err));

module.exports = sequelize;

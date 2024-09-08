const express = require('express');
const admin = express.Router();
const {
    getAllUsers,
    getAllAccounts,
    getAllMovements,
    // Importar las demás funciones...
} = require('../controllers/adminController');

admin.get('/allusers', getAllUsers);
admin.get('/allaccounts', getAllAccounts);
admin.get('/allmovements', getAllMovements);
// Añadir más rutas y funciones de los controladores...

module.exports = admin;

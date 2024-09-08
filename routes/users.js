const express = require('express');
const users = express.Router();
const usersController = require('../controllers/usersController');

// Rutas de autenticación de usuarios
users.post("/signin", usersController.signUp);

users.post("/login", usersController.signIn);

module.exports = users;

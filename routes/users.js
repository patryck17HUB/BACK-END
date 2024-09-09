const express = require('express');
const users = express.Router();
const usersController = require('../controllers/usersController');

// Rutas de autenticación de usuarios
users.post("/signup", usersController.signUp);

users.post("/login", usersController.logIn);

module.exports = users;

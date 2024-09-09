const express = require('express');
const updateUsers = express.Router();
const updateUsersController = require('../controllers/updateUsersController');

// Rutas de actualización de usuarios
updateUsers.get('/', (req, res) => {
    return res.status(200).json({ code: 1, message: "Pasaste la autenticación" });
});

updateUsers.get('/user', updateUsersController.getUserDetails);

updateUsers.post('/confirmpassword', updateUsersController.confirmPassword);

updateUsers.put('/password', updateUsersController.updatePassword);

updateUsers.put('/email', updateUsersController.updateEmail);

updateUsers.put('/username', updateUsersController.updateUsername);

updateUsers.delete('/delete', updateUsersController.deleteUser);

module.exports = updateUsers;

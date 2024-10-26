const express = require('express');
const updateUsers = express.Router();
const updateUsersController = require('../controllers/updateUsersController');

updateUsers.get('/user', updateUsersController.getUserDetails);

updateUsers.post('/confirmpassword', updateUsersController.confirmPassword);

updateUsers.put('/password', updateUsersController.updatePassword);

updateUsers.put('/email', updateUsersController.updateEmail);

updateUsers.put('/username', updateUsersController.updateUsername);

updateUsers.delete('/delete', updateUsersController.deleteUser);

module.exports = updateUsers;

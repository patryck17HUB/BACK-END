const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Función para buscar o crear un usuario en la base de datos
function findOrCreate({ googleID }, done) {
  const query = 'SELECT * FROM users WHERE googleID = ?';
  db.query(query, [googleID], (err, rows) => {
    if (err) {
      return done(err, null);
    }

    if (rows.length > 0) {
      return done(null, rows[0]);
    }

    // Datos de prueba
    const username = 'testuser';
    const password = 'testpassword';  // Asegúrate de hashear esto en un entorno real
    const email = 'testuser@example.com';
    const first_name = 'Test';
    const last_name = 'User';

    // Modificación del query para insertar los datos de prueba
    const insertQuery = `
      INSERT INTO users (username, password, email, first_name, last_name, googleID) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    console.log(googleID);
    
    db.query(insertQuery, [username, password, email, first_name, last_name, googleID], (err, result) => {
      if (err) {
        return done(err, null);
      }

      const userID = result.insertId;
      const selectInsertedQuery = 'SELECT * FROM users WHERE user_id = ?';
      db.query(selectInsertedQuery, [userID], (err, insertedUser) => {
        if (err) {
          return done(err, null);
        }
        return done(null, insertedUser[0]);
      });
    });
  });
}

module.exports = {
  findOrCreate,
};

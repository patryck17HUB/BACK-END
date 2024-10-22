const mysql = require('mysql');
const util = require('util');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'la-mejor-bd-waos.czsoiskc2fm0.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'Ohz5m0ngJAvz1M0qs66S',
    database: 'bdBanco'
});

pool.query = util.promisify(pool.query);
module.exports = pool;
const mysql = require("mysql");

var connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'g@M3mysql',
    database: 'vacCenter'
});

module.exports = connection;
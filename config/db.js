const mysql = require('mysql2');

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '12345',
    database : 'ITSECWB_DB'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the MySQL server.');
});

module.exports = connection;

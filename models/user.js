const db = require('../config/db');

const User = {
    create: (userData, callback) => {
        const query = `INSERT INTO users (firstname, lastname, email, phone, profile_photo, password, role) VALUES (?, ?, ?, ?, ?, ?, 'user')`;
        db.query(query, [userData.firstname, userData.lastname, userData.email, userData.phone, userData.profilePhoto, userData.password], callback);
    },

    findByEmail: (email, callback) => {
        const query = `SELECT * FROM users WHERE email = ?`;
        db.query(query, [email], callback);
    },

    findByPhone: (phone, callback) => {
        const query = `SELECT * FROM users WHERE phone = ?`;
        db.query(query, [phone], callback);
    },

    get_users: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users'; 
            db.query(query, (error, results, fields) => {
              if (error) {
                return reject(error);
              }
              resolve(results);
            });
          });
    }
};

module.exports = User;
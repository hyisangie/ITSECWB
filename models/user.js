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
  },
  lock_user: (email) => {
    return new Promise((resolve, reject) => {
      // Query the user first
      const userQuery = 'SELECT * FROM users WHERE email = ?';
      db.query(userQuery, [email], (err, results) => {
        if (err) {
          return reject(err);
        }
        if (results.length === 0) {
          return reject(new Error('User not found'));
        }

        // Update the user to be locked
        const updateQuery = 'UPDATE users SET isLocked = 1 WHERE email = ?';
        db.query(updateQuery, [email], (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  },

  unlock_user: (id) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET isLocked = 0 WHERE id = ?'

      db.query(query, [id], (err, results) => {
        if (err) {
          return reject(err)
        } else {
          resolve()
        }
      })
    })
  }
};

module.exports = User;
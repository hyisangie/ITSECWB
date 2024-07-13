const db = require('../config/db');

const Application = {
    create: (applicationData, callback) => {
        const query = `INSERT INTO applications (item_id, quantity, purpose, applicant_email) VALUES (?, ?, ?, ?)`;
        db.query(query, [applicationData.item_id, applicationData.quantity, applicationData.purpose, applicationData.applicant_email], callback);
    },
    findById: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT applications.*, items.name as item_name FROM applications JOIN items ON applications.item_id = items.id WHERE applications.id = ?';
            db.query(query, [id], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results[0]);
            });
        });
    },
    updateById: (id, applicationData) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE applications SET item_id = ?, quantity = ?, purpose = ? WHERE id = ?';
            db.query(query, [applicationData.item_id, applicationData.quantity, applicationData.purpose, id], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    },
    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT applications.*, items.name as item_name FROM applications JOIN items ON applications.item_id = items.id WHERE applicant_email = ? ORDER BY created_at DESC`;
            db.query(query, [email], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    },
    getApplicationsByStatus: (status) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT applications.*, items.name as item_name FROM applications JOIN items ON applications.item_id = items.id WHERE status = ? ORDER BY created_at DESC';
            db.query(query, [status], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    },
    
    findByEmailAndStatus: (email, status) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT applications.*, items.name as item_name FROM applications JOIN items ON applications.item_id = items.id WHERE applicant_email = ? AND status = ? ORDER BY created_at DESC';
            db.query(query, [email, status], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    },

    get_applications: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT applications.*, items.name as item_name FROM applications JOIN items ON applications.item_id = items.id ORDER BY created_at DESC'; 
            db.query(query, (error, results, fields) => {
              if (error) {
                return reject(error);
              }
              resolve(results);
            });
          });
      },
    update_status: (id, newStatus) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE applications SET status = ? WHERE id = ?';
            db.query(query, [newStatus, id], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    }
};

module.exports = Application;
const db = require('../config/db');

const Item = {
  get_items: () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, name FROM items'; 
        db.query(query, (error, results, fields) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        });
      });
  }
};

module.exports = Item;
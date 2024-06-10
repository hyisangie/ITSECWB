const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// const fileFilter = (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (extname && mimetype) {
//         cb(null, true);
//     } else {
//         cb('Error: Images Only!');
//     }
// };

const upload = multer({
    storage: storage,
    // fileFilter: fileFilter,
    // limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
    limits: 0
}).single('profilePhoto');

module.exports = upload;

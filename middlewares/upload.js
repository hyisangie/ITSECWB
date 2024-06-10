const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Set up storage using multer's diskStorage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Use the original file extension
    }
});

// Initialize Multer with the storage configuration
const upload = multer({
    storage: storage,
    // limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
}).single('profilePhoto');

// Middleware to check the magic number after the file is uploaded
function checkMagicNumber(req, res, next) {
    if (!req.file) {
        return next(new Error('No file uploaded.'));
    }

    const file = req.file;
    const buffer = Buffer.alloc(10);
    
    fs.open(file.path, 'r', (err, fd) => {
        if (err) {
            return next(err);
        }

        fs.read(fd, buffer, 0, 10, 0, (err, bytesRead, buffer) => {
            if (err) {
                fs.close(fd, () => next(err));
            } else {
                const fileType = checkMagicNumbers(buffer);
                fs.close(fd, (err) => {
                    if (err) {
                        return next(err);
                    }
                    if (!fileType) {
                        fs.unlink(file.path, () => {}); // Optionally delete the file
                        return next(new Error('Invalid image file type'));
                    }
                    next();
                });
            }
        });
    });
}

// Utility function to check magic numbers
function checkMagicNumbers(buffer) {
    const signatures = {
        'png': '89504e470d0a1a0a',
        'jpg': 'ffd8ff',
        'gif': ['474946383761', '474946383961'] // GIF87a and GIF89a
    };
    const hex = buffer.toString('hex', 0, buffer.length);
    if (hex.startsWith(signatures.png)) {
        return 'image/png';
    } else if (hex.startsWith(signatures.jpg)) {
        return 'image/jpeg';
    } else if (signatures.gif.some(sig => hex.startsWith(sig))) {
        return 'image/gif';
    }
    return false;
}

module.exports = { upload, checkMagicNumber };

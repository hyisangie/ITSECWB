const express = require('express');
const router = express.Router();
const path = require('path');

const upload = require('./middlewares/upload.js');
const loginAttempts = require('./middlewares/loginattempts.js');

const user = require('./controller/user');

router.get('/register', user.render_register);
router.post('/register-user', (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).send(err);
        }
        next();
    });
}, user.create_user);

router.get('/login', user.render_login);
router.post('/login-user', loginAttempts, user.loginUser);

router.get('/profile', user.render_profile);

router.get('/admin', user.render_admin);

router.get('/logout', user.logoutUser);

module.exports = router;
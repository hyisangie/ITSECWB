const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const User = require('../models/User');

const user = {
    render_register: async function (req, res) {
        res.render('register');
    },

    render_login: async function (req, res) {
        res.render('login');
    },

    render_admin: async function (req, res) {

        const users = await User.get_users();

        res.render('admin', { users });
    },

    render_profile: async function (req, res) {
        res.render('profile', { user: req.session.user });
    },

    loginUser: async function (req, res) {
        const { email, password } = req.body;
    
        // Input validation
        if (!email || !password) return res.status(400).send('All fields are required.');

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) return res.status(400).send('Invalid input.');
    
        User.findByEmail(email, async (err, results) => {
            if (err) {
                console.error('Error finding user by email:', err);
                return res.status(500).send('Server error.');
            }
    
            if (results.length === 0) {
                req.session.loginAttempts++;
                console.log("wrong email");
                return res.redirect('login');
                // return res.status(400).send('No user found with this email.');
            }
    
            const user = results[0];
            
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
            // if (hashedPassword !== user.password) {
                req.session.loginAttempts++;
                return res.redirect('login');
            }
    
            req.session.loginAttempts = 0;
            req.session.user = user;
            if (user.role === 'admin') res.redirect('admin');
            else res.redirect('profile');
        });
    },

    create_user: async function (req, res) {
        const { firstname, lastname, email, password, confirmPassword } = req.body;
        let phone = req.body.phone;

        // Input validation
        if (!firstname || !lastname || !email || !phone || !password || !confirmPassword) return res.status(400).send('All fields are required.');

        if (password !== confirmPassword) return res.status(400).send('Passwords do not match.');

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^(\+63|0)?9\d{9}$/;

        if (!emailRegex.test(email)) return res.status(400).send('Invalid email format.');

        if (!phoneRegex.test(phone)) return res.status(400).send('Invalid phone number format.');

        if (phone.startsWith('9')) phone = '0' + phone;
        if (phone.startsWith('+63')) phone = '0' + phone.substring(3);

        // Check if email already exists
        User.findByEmail(email, async (err, results) => {
            if (err) return res.status(500).send('Server error.');
            if (results.length > 0) return res.status(400).send('Email already registered.');

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            // const hashedPassword = password;

            // Save user to database
            const profilePhoto = req.file ? req.file.filename : null;
            const newUser = { firstname, lastname, email, phone, profilePhoto, password: hashedPassword };

            User.create(newUser, (err, result) => {
                if (err) {
                    if (profilePhoto) fs.unlinkSync(path.join(__dirname, '../public/uploads/', profilePhoto)); // Delete the uploaded file if DB insert fails
                    console.log(err)
                    return res.status(500).send('Failed to register user.');
                }
                res.send('User registered successfully.');
            });
        });
    },

    logoutUser: function(req, res){
        if(req.session){ //If session exists
            req.session.destroy(()=>{ //Destroy current session
                res.clearCookie('connect.sid'); //Clear cookie data
                res.redirect('/'); //Return to login screen
            });
        }
    }
}

module.exports = user;
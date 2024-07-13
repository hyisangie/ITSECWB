const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");

const User = require("../models/user");
const Item = require("../models/item");

const LOGGED_IN = 1;
const LOGGED_OUT = 0;

const user = {
    render_register: async function (req, res) {
        const error = req.flash('error');
        res.render("register",  { error: error.length ? error[0] : null });
    },

    render_login: async function (req, res) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        const errorMessage = req.flash('error');
        res.render("login", { error: errorMessage });
    },

    render_admin: async function (req, res) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        const users = await User.get_users();

        res.render("admin", { users });
    },

    render_profile: async function (req, res) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.render("profile", { user: req.session.user });
    },

    render_index: async function (req, res) {
        if (req.session.user) {
            res.redirect("/applications")
        } else res.redirect("/login");
    },

    login_user: async function (req, res) {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            req.flash("error", "All fields are required.");
            return res.redirect("/");
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            req.flash("error", "Invalid Email Format.");
            return res.redirect("/");
        }

        User.findByEmail(email, async (err, results) => {
            if (err) {
                req.flash("error", "Server error.");
                return res.redirect("/");
            }

            if (results.length === 0) {
                req.session.loginAttempts++;
                req.flash("error", "Wrong Email and Password.");
                return res.redirect("/");
            }

            const user = results[0];

            if (!(await bcrypt.compare(password, user.password))) {
                req.session.loginAttempts++;
                req.flash("error", "Wrong Email and Password.");
                return res.redirect("/");
            }

            req.session.loginAttempts = 0;

            req.session.user = user;
            req.session.lastActivity = new Date().getTime();
            logger.authenticateUser(req.session.user.email, LOGGED_IN);
            res.redirect("/");
        });
    },

    create_user: async function (req, res) {
        let error1;
        const { firstname, lastname, email, password, confirmPassword } = req.body;
        const profilePhoto = req.file ? req.file.filename : null;
        let phone = req.body.phone;

        // Input validation
        if (!firstname || !lastname || !email || !phone || !password || !confirmPassword) {
            if (profilePhoto) fs.unlinkSync(path.join(__dirname, "../public/uploads/", profilePhoto));
            req.flash("error", "All fields are required.");
            return res.redirect("/register");
        }

        if (password !== confirmPassword) {
            if (profilePhoto) fs.unlinkSync(path.join(__dirname, "../public/uploads/", profilePhoto));
            req.flash("error", "Passwords do not match.");
            return res.redirect("/register");
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^(\+63|0)?9\d{9}$/;
        // const phoneRegex = /^(0|(\+63)\s?|9)\d{3}[-\s]?\d{3}[-\s]?\d{4}$/;

        if (!emailRegex.test(email)) {
            if (profilePhoto) fs.unlinkSync(path.join(__dirname, "../public/uploads/", profilePhoto));
            req.flash("error", "Invalid email format.");
            return res.redirect("/register");
        }

        if (!phoneRegex.test(phone)) {
            if (profilePhoto) fs.unlinkSync(path.join(__dirname, "../public/uploads/", profilePhoto));
            req.flash("error", "Invalid phone number format.");
            return res.redirect("/register");
        }

        if (phone.startsWith("9")) phone = "0" + phone;
        if (phone.startsWith("+63")) phone = "0" + phone.substring(3);
        // Check if email already exists
        User.findByEmail(email, async (err, results) => {
            if (err) {
                if (profilePhoto) fs.unlinkSync(path.join(__dirname, "../public/uploads/", profilePhoto));
                req.flash("error", "Server error.");
                return res.redirect("/register");
            }
            if (results.length > 0) {
                if (profilePhoto) fs.unlinkSync(path.join(__dirname, "../public/uploads/", profilePhoto));
                req.flash("error", "Email already registered.");
                return res.redirect("/register");
            }
            // Check if phone already exists
            User.findByPhone(phone, async (err, results) => {
                if (err) {
                    if (profilePhoto) fs.unlinkSync(path.join(__dirname, "../public/uploads/", profilePhoto));
                    req.flash("error", "Server error.");
                    return res.redirect("/register");
                }
                if (results.length > 0) {
                    error1 = "phone1";
                    if (profilePhoto) fs.unlinkSync(path.join(__dirname, "../public/uploads/", profilePhoto));
                    req.flash("error", "Phone number already registered.");
                    return res.redirect("/register");
                }
                const hashedPassword = await bcrypt.hash(password, 10);
                // const profilePhoto = req.file ? req.file.filename : null;
                const newUser = { firstname, lastname, email, phone, profilePhoto, password: hashedPassword };

                User.create(newUser, (err, result) => {
                    if (err) {
                        if (profilePhoto) fs.unlinkSync(path.join(__dirname, "../public/uploads/", profilePhoto));
                        req.flash("error", "Failed to register user.");
                        return res.redirect("/register");
                    }
                    req.flash("success", "User registered successfully.");
                    res.redirect("/");
                });
            });
        });
    },

    logout_user: function (req, res) {
        if (req.session) {
            logger.authenticateUser(req.session.user.email, LOGGED_OUT);
            req.session.destroy(() => {
                // Destroy current session
                // res.clearCookie("connect.sid"); // Clear cookie data
            });
        }
        res.redirect("/");
    },
};

module.exports = user;
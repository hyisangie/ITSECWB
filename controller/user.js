const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const { handleError } = require("../utils/error_handler");
const User = require("../models/user");

const LOGGED_IN = 1;
const LOGGED_OUT = 0;

const user = {
    render_register: async function (req, res) {
        try {
            const error = req.flash('error');
            if (req.session.user !== undefined && req.session.user.role === "admin") {
                logger.adminAction(req.session.user, "Render register page.")
            } else {
                logger.log("Render Page", req.session.user, "Render register page.")
            }
            res.render("register", { error: error.length ? error[0] : null });
        } catch (err) {
            handleError(err);
            logger.log("Error", req.session.user, "Render register page: " + err.stack)
            return res.render('404');
        }
    },

    render_login: async function (req, res) {
        try {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            const errorMessage = req.flash('error');
            if (req.session.user !== undefined && req.session.user.role === "admin") {
                logger.adminAction(req.session.user, "Render login page.")
            } else {
                logger.log("Render Page", req.session.user, "Render login page.")
            }

            res.render("login", { error: errorMessage });
        } catch (err) {
            handleError(err);
            logger.log("Error", req.session.user, "Render login page: " + err.stack)
            return res.render('404');
        }

    },

    render_admin: async function (req, res) {
        try {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            const users = await User.get_users();
            if (req.session.user !== undefined && req.session.user.role === "admin") {
                logger.adminAction(req.session.user, "Render admin page.")
            } else {
                logger.log("Render Page", req.session.user, "Render admin page.")
            }
            res.render("admin", { users });
        } catch (err) {
            handleError(err);
            logger.log("Error", req.session.user, "Render admin page: " + err.stack)
            return res.render('404');
        }
    },

    render_profile: async function (req, res) {
        try {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            if (req.session.user !== undefined && req.session.user.role === "admin") {
                logger.adminAction(req.session.user, "Render profile page.")
            } else {
                logger.log("Render Page", req.session.user, "Render profile page.")
            }

            res.render("profile", { user: req.session.user });
        } catch (err) {
            handleError(err);
            logger.log("Error", req.session.user, "Render profile page: " + err.stack)
            return res.render('404');
        }

    },

    render_index: async function (req, res) {
        try {
            if (req.session.user) {
                if (req.session.user.role === "admin") {
                    logger.adminAction(req.session.user, "Render index page.")
                } else {
                    logger.log("Render Page", req.session.user, "Render index page.")
                }
                res.redirect("/applications")
            } else res.redirect("/login");
        } catch (err) {
            handleError(err);
            logger.log("Error", req.session.user, "Render index page: " + err.stack)
            return res.render('404');
        }
    },

    login_user: async function (req, res) {
        try {
            // throw new Error("Test error");
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
                if (req.session.user !== undefined && req.session.user.role === "admin") {
                    logger.authenticateUser(req.session.user + "(admin)", LOGGED_IN);
                } else {
                    logger.authenticateUser(req.session.user, LOGGED_IN);
                }
                res.redirect("/");
            });
        } catch (err) {
            handleError(err);
            logger.log("Error", req.session.user, "Login Error: " + err.stack)
            return res.render('404');
        }
    },

    create_user: async function (req, res) {
        try {
            const { firstname, lastname, email, password, confirmPassword } = req.body;
            const profilePhoto = req.file ? req.file.filename : null;
            let phone = req.body.phone;

            // Input validation
            if (!firstname || !lastname || !email || !phone || !password || !confirmPassword) {
                if (profilePhoto) fs.unlinkSync(path.join(__dirname, "../public/uploads/", profilePhoto));
                req.flash("error", "All fields are required.");
                return res.redirect("/register");
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;

            if (password !== confirmPassword) {
                if (profilePhoto) fs.unlinkSync(path.join(__dirname, "../public/uploads/", profilePhoto));
                req.flash("error", "Passwords do not match.");
                return res.redirect("/register");
            } else {
                if (!passwordRegex.test(password)) {
                    if (profilePhoto) fs.unlinkSync(path.join(__dirname, "../public/uploads/", profilePhoto));
                    req.flash("error", `Invalid password please.
                        Password must contain:
                        At least 10 characters long
                        Contains at least one uppercase letter
                        Contains at least one lowercase letter
                        Contains at least one digit
                        Contains at least one special character (e.g., !@#$%^&*)`);
                    return res.redirect("/register");
                }
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
                            logger.log("Create User", req.session.user, "Failed to register user.")
                            return res.redirect("/register");
                        }
                        logger.log("Create User", req.session.user, "User: " + newUser.email + " Created.")
                        req.flash("success", "User registered successfully.");
                        res.redirect("/");
                    });
                });
            });
        } catch (err) {
            handleError(err)
            logger.log("Error", req.session.user, "Create User Error: " + err.stack)
            return res.render('404');
        }
    },

    logout_user: function (req, res) {
        try {
            if (req.session) {
                if (req.session.user !== undefined && req.session.user.role === "admin") {
                    logger.authenticateUser(req.session.user + "(admin)", LOGGED_OUT);
                } else {
                    logger.authenticateUser(req.session.user, LOGGED_OUT);
                }
                req.session.destroy(() => {
                    // Destroy current session
                    // res.clearCookie("connect.sid"); // Clear cookie data
                });
            }
            logger.log("Log Out User", req.session.user, "Failed to log out user.")
            res.redirect("/");
        } catch (err) {
            handleError(err)
            logger.log("Error", req.session.user, "Logout Error: " + err.stack)
            return res.render('404');
        }
    },
};

module.exports = user;
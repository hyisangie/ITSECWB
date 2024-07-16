const express = require("express");
const router = express.Router();

const { upload, checkMagicNumber } = require("./middlewares/upload.js");
const loginAttempts = require("./middlewares/loginattempts.js");
const {
  checkAuth,
  isAuth,
  checkAuthinLogin,
} = require("./middlewares/session.js");

const user = require("./controller/user");
const application = require("./controller/application");

router.get("/register", user.render_register);
router.post(
  "/register-user",
  upload,
  checkMagicNumber,
  user.create_user,
  (error, req, res, next) => {
    if (error) {
      req.flash("error", error.message);
      const err = new Error();
      err.status = 500
      return res.redirect("/register");
    }
  }
);

router.get("/", user.render_index);

router.get("/login", checkAuthinLogin, user.render_login);
router.post("/login-user", loginAttempts, user.login_user);

router.get("/profile", isAuth, user.render_profile);

router.get("/admin", checkAuth, user.render_admin);

router.get("/logout", user.logout_user);

router.get("/request-form", isAuth, application.render_request_form);
router.post("/apply", isAuth, application.apply);
router.get("/applications", isAuth, application.render_application);
router.post("/update-status/:id", checkAuth, application.change_status);
router.get("/edit-form", isAuth, application.render_request_form);
router.post("/update-application/:id", isAuth, application.update_application);
router.get('/unlock_user/:user_id', user.unlock_user);

// Handle 404 - Not Found
router.use((req, res, next) => {
  res.status(404).render("404"); // assuming you have a 404.ejs file in your views directory
});

module.exports = router;
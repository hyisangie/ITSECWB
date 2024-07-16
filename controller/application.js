const Application = require("../models/application");
const Item = require("../models/item");
const logger = require("../utils/logger");
const { handleError } = require("../utils/error_handler");

const application = {
    render_application: async function (req, res) {
        try {
            const user = req.session.user;
            const email = user.email;
            const statusFilter = req.query.status;
            let applications;
            if (user.role == "admin") {
                if (statusFilter) {
                    applications = await Application.getApplicationsByStatus(statusFilter);
                } else {
                    applications = await Application.get_applications();
                }
            } else {
                if (statusFilter) {
                    applications = await Application.findByEmailAndStatus(email, statusFilter);
                } else {
                    applications = await Application.findByEmail(email);
                }
            }

            if (req.session.user !== undefined && req.session.user.role === "admin") {
                logger.adminAction(req.session.user, "Render applications page.")
            } else {
                logger.log("Render Page", req.session.user, "Render applications page.")
            }
            res.render("applications", { applications: applications, user: user, currentStatus: statusFilter });
        } catch (err) {
            handleError(err)
            logger.log("Error", req.session.user, "Render applications page: " + err.stack)
            return res.render('404');
        }
    },
    render_request_form: async function (req, res) {
        try {
            if (req.path === '/edit-form') {
                const items = await Item.get_items();
                const user = req.session.user;
                let application = null;
                const applicationId = req.query.id;
                if (!applicationId) {
                    return res.status(400).send('Application ID is required for editing');
                }
                application = await Application.findById(applicationId);
                if (!application || application.applicant_email !== user.email) {
                    return res.status(404).send('Application not found or you do not have permission to edit');
                }
            }


            if (req.session.user !== undefined && req.session.user.role === "admin") {
                logger.adminAction(req.session.user, "Render request form.")
            } else {
                logger.log("Render Page", req.session.user, "Render request form.")
            }
            res.render("request-form", { items: items, user: user, application: application });
        } catch (err) {
            handleError(err)
            logger.log("Error", req.session.user, "Render request form: " + err.stack)
            return res.render('404');
        }

    },

    apply: async function (req, res) {
        try {
            const { item_id, quantity, purpose } = req.body;
            const applicant_email = req.session.user.email;
            const newApplication = { item_id, quantity, purpose, applicant_email };
            Application.create(newApplication, (err, result) => {
                if (err) {
                    req.flash("error", "Failed to create application.");
                    return res.redirect("/");
                }
                req.flash("success", "Applied successfully.");
                logger.log("Apply", req.session.user, "Apply Stationery.")
                res.redirect("/");
            });
            logger.log("Apply", req.session.user, "Apply failed.")
        } catch (err) {
            handleError(err)
            logger.log("Error", req.session.user, "Apply: " + err.stack)
            return res.render('404');
        }

    },
    change_status: async function (req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await Application.update_status(id, status);
            req.flash('success', 'Application status updated successfully.');
            logger.adminAction(req.session.user, "Status Changed Succesfully.")
            res.redirect('/applications');
        } catch (error) {
            handleError(err)
            logger.log("Error", req.session.user, "Status Change: " + err.stack)
            return res.render('404');
        }
    },
    update_application: async function (req, res) {

        try {
            const applicationId = req.params.id;
            const user = req.session.user;
            const { item_id, quantity, purpose } = req.body;

            // check if app exists
            const application = await Application.findById(applicationId);
            if (!application) {
                logger.log("Update Application", req.session.user, "Application not found")
                return res.status(404).send('Application not found');
            }
            if (application.applicant_email !== user.email) {
                logger.log("Update Application", req.session.user, "You do not have permission to update this application")
                return res.status(403).send('You do not have permission to update this application');
            }
            if (application.status !== 'pending') {
                logger.log("Update Application", req.session.user, "Only pending applications can be updated")
                return res.status(400).send('Only pending applications can be updated');
            }

            // update app
            await Application.updateById(applicationId, { item_id, quantity, purpose });
            logger.log("Update Application", req.session.user, "Update Application Succesfully.")
            res.redirect('/applications');
        } catch (error) {
            handleError(err)
            logger.log("Error", req.session.user, "Update Application: " + err.stack)
            return res.render('404');
        }
    },
};

module.exports = application;
const nodemailer = require("nodemailer");
require('dotenv').config();
const crypto = require('crypto');
const PasswordReset = require("../schemas/passwordResetToken");
const mail = require("@sendgrid/mail");
const res = require("express/lib/response");

const sendPasswordResetEmail = (userID, toEmail, passwordResetToken) => {
    
    try {
        var Transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        });

        let mailOptions;
        let sender = "Shreddit";

        mailOptions = {
            from: sender,
            to: toEmail,
            subject: "Shreddit Password reset",
            html:  `Click <a href=${bp.buildPath("passwordReset")}/${userID}/${passwordResetToken}>here</a> to reset your password.`
        }

        Transport.sendMail(mailOptions, function(error, response) {
            if(error) console.log("Password Reset Email did not send.");
            else {
                console.log(`If ${toEmail} exists in our system, password reset email has been sent`);
            }
    
        });
    } catch(error) {
        console.log(error);
    }
    /*
    // Creates a reset string
    const passwordResetString = crypto.randomBytes(32).toString('hex');

    PasswordReset
        .deleteMany({userID: _id})
        .then((result) => {


            const mailOptions = {
                from: "Shreddit",
                to: email,
                subject: "Shreddit Password Reset",
                html:  `Click <a href=${redirectURL}/passwordReset/${userID}/${passwordResetString}>here</a> to reset your password.`
            }
        })
        .catch((error) => {
            // Error while clearing existing record
            res.json({
                status: "FAILED",
                in: "emailUtils -> sendPasswordReset.js",
                message: "Clearing existing password reset records failed"
            });
        })
    */

    
}

module.exports = sendPasswordResetEmail;
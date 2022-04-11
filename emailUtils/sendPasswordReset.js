const nodemailer = require("nodemailer");
require('dotenv').config();
const crypto = require('crypto');
const PasswordReset = require("../schemas/passwordResetSchema");

const sendPasswordResetEmail = ({_id, email}, redirectURL,res) => {
    
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
}
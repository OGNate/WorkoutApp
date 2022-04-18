const nodemailer = require("nodemailer");
require('dotenv').config();
const crypto = require('crypto');
const PasswordReset = require("../schemas/passwordResetToken");
const mail = require("@sendgrid/mail");
const res = require("express/lib/response");

const sendPasswordResetEmail = (userID, firstName, toEmail, passwordResetToken) => {
    
    var bp = require("../frontend/src/utils/Path.js");

    const templateSrc = fs.readFileSync(path.join(__dirname, "./templates/reset-password.hbs"), "utf8")

    try {

        const emailTransporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
               user: process.env.USER,
               pass: process.env.PASS
            },
            debug: false,
            logger: true
        });
    
        var mailOptions;
        var actionUrl = bp.buildPath("passwordReset") + "/" + userID + "/" + passwordResetToken;

        const template = handlebars.compile(templateSrc);

        const htmlToSend = template({
            name: firstName,
            action_url: actionUrl
        });
    
        mailOptions = {
            from: "Shreddit Team",
            to: toEmail,
            subject: "Shreddit: Reset your password",
            html: htmlToSend
        };
    
        emailTransporter.sendMail(mailOptions, function(error, response) {
            if(error) {
                console.log("Transport sendmail does not work");
            }
            else console.log(`Email verification sent to ${toEmail}`);
        });    

    } catch(error) {
        console.log(error);
    }   
}

module.exports = sendPasswordResetEmail;
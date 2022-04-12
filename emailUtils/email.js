const nodemailer = require("nodemailer");

require('dotenv').config();

const sendVerificationEmail = (userID, toEmail, uniqueEmailToken) => {
    
    var bp = require("../frontend/src/components/Path.js");
        
    var transporter = nodemailer.createTransport({
        host: "smtp.office365.com", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        auth: {
            user: process.env.USER,
            pass: process.env.PASS
        },
        tls: {
            ciphers:'SSLv3'
        }
    });

    var mailOptions;
    let sender = "Shreddit";

    mailOptions = {
        from: sender,
        to: toEmail,
        subject: "Shreddit: Please Verify Email",
        text: "Testing email verification"
    };

    transporter.sendMail(mailOptions, function(error, response) {
        if(error) {
            console.log(error);
        }
        else console.log(`Email Verification sent to ${toEmail}`);
    });    
}

module.exports = sendVerificationEmail;
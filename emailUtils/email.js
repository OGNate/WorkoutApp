const res = require("express/lib/response");
const nodemailer = require("nodemailer");
require('dotenv').config();

const sendVerificationEmail = (userID, toEmail, uniqueEmailToken) => {
    
    var bp = require("../frontend/src/utils/Path.js");

    try {

        const emailTransporter = nodemailer.createTransport({
            host: 'smtp.mail.yahoo.com',
            port: 465,
            service:'yahoo',
            secure: false,
            auth: {
               user: process.env.USER,
               pass: process.env.PASS
            },
            debug: false,
            logger: true
        });
    
        var mailOptions;
        let sender = "Shreddit";
    
        mailOptions = {
            from: sender,
            to: toEmail,
            subject: "Shreddit: Please Verify Email",
            html:  `Click <a href=${bp.buildPath("emailVerification")}/${userID}/${uniqueEmailToken}>here</a> to verify you email.`
        };
    
        emailTransporter.sendMail(mailOptions, function(error, response) {
            if(error) {
                console.log("Transport sendmail does not work");
            }
            else console.log(`Email Verification sent to ${toEmail}`);
        });    

    } catch(error) {
        console.log(error);
    }
}

module.exports = sendVerificationEmail;
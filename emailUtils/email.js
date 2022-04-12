const res = require("express/lib/response");
const nodemailer = require("nodemailer");
require('dotenv').config();

const sendVerificationEmail = (userID, toEmail, uniqueEmailToken) => {
    
    var bp = require("../frontend/src/components/Path.js");

    try {
        var Transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        });
    
        var mailOptions;
        let sender = "Shreddit";
    
        mailOptions = {
            from: sender,
            to: toEmail,
            subject: "Shreddit: Please Verify Email",
            html:  `Click <a href=${bp.buildPath("emailVerification")}/${userID}/${uniqueEmailToken}>here</a> to verify you email.`
        };
    
        Transport.sendMail(mailOptions, function(error, response) {
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
const res = require("express/lib/response");
const nodemailer = require("nodemailer");
require('dotenv').config();

/*
const sendEmail = async(email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text
        });

        console.log("email sent successfully");
    } 
    catch(error) {
        console.log("email not sent");
    }
}
*/

const sendEmail = (userID, toEmail, uniqueEmailToken) => {
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
            html:  `Click <a href=${process.env.LOCAL_HOST}/emailVerification/${userID}/${uniqueEmailToken}>here</a> to verify you email.`
        };
    
        Transport.sendMail(mailOptions, function(error, response) {
            if(error) {
                console.log("Transport sendmail does not work");
            }
            else console.log("Message Sent");
        });    

    } catch(error) {
        console.log(error);
    }
}

module.exports = sendEmail;
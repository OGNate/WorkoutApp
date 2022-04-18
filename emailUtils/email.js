const res = require("express/lib/response");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars")
const fs = require("fs")
const path = require("path")

require('dotenv').config();

const sendVerificationEmail = (userID, firstName, toEmail, uniqueEmailToken) => {
    
    var bp = require("../frontend/src/utils/Path.js");

    const templateSrc = fs.readFileSync(path.join(__dirname, "./templates/verify-email.hbs"), "utf8")

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
        var actionUrl = bp.buildPath("emailVerification") + "/" + userID + "/" + uniqueEmailToken;

        const template = handlebars.compile(emailTemplateSource);

        const htmlToSend = template({
            name: firstName,
            action_url: actionUrl
        });
    
        mailOptions = {
            from: "shreddit.ucf@gmail.com",
            to: toEmail,
            subject: "Shreddit: Please Verify Email",
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

module.exports = sendVerificationEmail;
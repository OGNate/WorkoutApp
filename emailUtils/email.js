const res = require("express/lib/response");
const nodemailer = require("nodemailer");
const handlebars = require('handlebars');

require('dotenv').config();

const sendVerificationEmail = (userID, firstName, toEmail, uniqueEmailToken) => {
    
    var bp = require("../frontend/src/utils/Path.js");

    let html = await readFile('/path/to/file', 'utf8');
    let template = handlebars.compile(html);

    var context = { 
        "name" : firstName, 
        "action_url" : `${bp.buildPath("emailVerification")}/${userID}/${uniqueEmailToken}`
    };

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
    
        mailOptions = {
            from: "shreddit.ucf@gmail.com",
            to: toEmail,
            subject: "Shreddit: Please Verify Email",
            html: template(context)
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
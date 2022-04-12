const nodemailer = require("nodemailer");
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
require('dotenv').config();

const OAuth2_client = new OAuth2(process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET);
OAuth2_client.setCredentials( {refresh_token: process.env.OAUTH_REFRESH_TOKEN});

const sendVerificationEmail = (userID, toEmail, uniqueEmailToken) => {

    // Gets a new access token
    const accessToken = OAuth2_client.getAccessToken();
    var bp = require("../components/Path.js");

    try {
        var Transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USER,
                clientId: process.env.OAUTH_CLIENT_ID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                refreshToken: process.env.OAUTH_REFRESH_TOKEN,
                accessToken: accessToken
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
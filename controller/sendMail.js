const nodemailer = require('nodemailer')
const {google} = require('googleapis')
const {OAuth2} = google.auth;
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground/'

const {
    MAILING_SERVICE_CLIENT_ID,
    MAILING_SERVICE_CLIENT_SECRET,
    MAILING_SERVICE_REFRESH_TOKEN,
    SENDER_EMAIL_ADDRESS
} = process.env

const oauth2client = new OAuth2(
    MAILING_SERVICE_CLIENT_ID,
    MAILING_SERVICE_CLIENT_SECRET,
    MAILING_SERVICE_REFRESH_TOKEN,
    OAUTH_PLAYGROUND
)

//SEND EMAIL
const sendEmail = (to, url,txt)=>{
    oauth2client.setCredentials({
        refresh_token: MAILING_SERVICE_REFRESH_TOKEN
    })
    const accesstoken = oauth2client.getAccessToken()
    const smtpTransport = nodemailer.createTransport({
        service:'gmail',
        auth:{
            type: 'OAuth2',
            user: SENDER_EMAIL_ADDRESS,
            clientId: MAILING_SERVICE_CLIENT_ID,
            clientSecret: MAILING_SERVICE_CLIENT_SECRET,
            refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
            accesstoken
        }
    })
    const mailOptions = {
        from: SENDER_EMAIL_ADDRESS,
        to:to,
        subject:'Digilearn Nigeria',
        html:`
        <div style="max-width:700px;margin:auto;padding:50px 20px;border:1px solid grey;">
        <h2 style="text-align:center;text-transform:uppercase;color:teal;">Welcome to Digilearn Nigeria</h2>
        <p>Congratulation! You 're almost ready to start using DigiLearn.
                Just click the button below to validate your email address.
        </p>
        <a href=${url} style="text-decoration:none";background:crimson;color:white;padding:10px 20px>${txt}</a>
        <p>If the button dosen't work for any reason, you can click the link below:</p>

        <div>${url}</div>
        </div>
        
        `
    }
    smtpTransport.sendMail(mailOptions,(err,info)=>{
        if(err) return err;
        return info
    })
}


module.exports = sendEmail
const nodemailer = require('nodemailer');
const path  = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '..',  '.env') });
let smtpHost = process.env.MAILTRAP_SMTPHOST || "smtp.mailtrap.io";
let smtpPort = process.env.SMTPPORT|| '2525';
let smtpUserName = process.env.SMTPUSERNAME|| "809ff05575e9d3";
let smtpPassword = process.env.SMTPPASSWORD|| "eb4d88ee8f6520";
let senderEmail = process.env.SENDEREMAIL|| "no-reply@fisecuritesgrp.com";

exports.sendEmail= async function(toMail, subject,body){
    console.log(smtpHost,smtpPort,smtpUserName,smtpPassword)
    let transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: smtpPort,
                    auth: {
                        user: smtpUserName,
                        pass: smtpPassword
                    }
                });

                let mailOptions = {
                    from: senderEmail,
                    to: toMail,
                    subject: subject,
                    html: body
                };
                console.log('sending case 1 email now');
                 transporter.sendMail(mailOptions, function(error){
                    if (error) {
                        throw new Error(error);
                        return false;
                        
                    } else{
                        
                        console.log(`Successfully sent an email notification`);
                        return true;
                        }
                });

}


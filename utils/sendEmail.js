import nodemailer from 'nodemailer';
import AppError from './errorUtils.js';

const sendEmail = async (email, message, subject) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT, //true for port 465 and false for other ports
            secure: false,
            auth: {
                user:process.env.SMTP_USER,
                pass:process.env.SMTP_PASS
            },
        });
    
        await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL, //email sender
            to: email, // receiver email
            subject: subject,
            html: message
        })
    } catch (e) {
        return new AppError(e.message, 402)
    }
}

export default sendEmail;
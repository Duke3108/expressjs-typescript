import nodemailer from "nodemailer";
import "dotenv/config";

interface SendMailBody {
  email: string;
  html: string;
  subject: string;
}

const sendMail = async ({ email, html, subject }: SendMailBody) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: '"Duke-Authentication" <no-reply>', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    html: html, // html body
  });

  return info;
};

export default sendMail;

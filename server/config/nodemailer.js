import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_API,
  },
});

export const sendEmail = async (email, subject, message) => {
  const mailOptions = {
    from: `"ByteBond" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: subject,
    text: message,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Message sent: ${info.messageId}`);
};

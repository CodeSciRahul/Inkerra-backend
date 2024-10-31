import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken'
import { verificationMessage } from "../constant/message.js";
import { passwordChangeMessage } from "../constant/message.js";

dotenv.config();

const APP_PASSWORD = process.env.App_password;
const SENDER_EMAIL = process.env.Sender_email;
const FRONTED_URL = process.env.Frontend_url;
const Secret_key = process.env.Email_Verification_Secret_key

const generateToken = async(RECEIVER_EMAIL) => {
  try {
    const payload = {
      receiver_mail: RECEIVER_EMAIL
    }
    const token = jwt.sign(
      payload,
      Secret_key,
      {expiresIn: "30m"}
    )
    return token
  } catch (error) {
    throw new Error(error)
  }
}

export const sendEmail = async (RECEIVER_EMAIL, purpose) => {
  const isSendVerification = purpose === "send verification link" ? true : false;
  const greeting = isSendVerification && verificationMessage?.GREETING
  const paragraph = isSendVerification ? verificationMessage?.PARAGRAPH : passwordChangeMessage?.PARAGRAPH
  const alert = isSendVerification ? verificationMessage?.ALERT : passwordChangeMessage?.ALERT
  try {
    const token = await generateToken(RECEIVER_EMAIL)
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SENDER_EMAIL,
        pass: APP_PASSWORD,
      },
    });
    const command = {
      from: `Inkerra Team <${SENDER_EMAIL}>`,
      to: RECEIVER_EMAIL,
      subject: "Verification Email",
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    h2 { margin: 0; }
    a { color: #007BFF; text-decoration: none; }
    .footer { margin-top: 20px; font-size: 0.9em; color: #555; }
  </style>
</head>
<body>
  <div>
    <p>Hello,</p>

    <p>Welcome to the Inkerra community! ${greeting ? greeting : ""}</p>

    <p>${paragraph}</p>

    ${isSendVerification ? `
      <p>
        <a href="${FRONTED_URL}/verify?token=${token}" style="color: #007BFF; text-decoration: none;">
          <strong>Click here to verify your account</strong>
        </a>
      </p>
    ` : ''}

    ${!isSendVerification ? `
   <p style="display: flex; align-items: center;">
  Temporary password: <span style="font-weight: bold; font-size: 1.2em; margin-left: 5px;">${purpose}</span>
</p>
    ` : ''}

    <p>${alert}</p>

    <p class="footer">
      Thank you for joining us!<br>
      <strong>The Inkerra Team</strong>
    </p>
  </div>
</body>
</html>
`,
    };
    const result = transport.sendMail(command);
    return result;
  } catch (error) {
    throw new Error(error?.message || "Error in Nodemailer")
  }
};

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Sqlite3 from "sqlite3";
import env from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../util/sendEmail.js";
import password from "secure-random-password";

const sqlite3 = Sqlite3.verbose();
env.config();

//save new user
export const signupService = async (payload) => {
  const { userName, email, password } = payload;
  const saltRounds = Number(process.env.Salt_Round);
  const db = new sqlite3.Database("./blog.db");
  const O_id = uuidv4();

  try {
     // Check if all required fields are provided
  if (!(userName && email && password)) {
    throw new Error("All field are required");
  }

    // check user exist or not.
    await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE email = ? OR userName = ?",
        [email, userName],
        (err, row) => {
          if (err) return reject(new Error(err));
          if (row) return reject(new Error("username or email already exist"));
          resolve();
        }
      );
    });

    await sendEmail(email, "send verification link");

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save the new user in the database
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (id, userName, email, password) VALUES (?, ?, ?, ?)",
        [O_id, userName, email, hashedPassword],
        function (err) {
          if (err) {
            reject(err); // Error while inserting data
          } else {
            resolve(O_id); // Return the ID of the inserted row
          }
        }
      );
    });
  } catch (error) {
    if (error === "username or email already exist") throw new Error(error);
    throw new Error(error?.message || "signup failed");
  } finally {
    db.close(); // Close the database connection
  }
};

//login in existing account.
export const loginService = async (payload) => {
  const db = new sqlite3.Database("./blog.db");
  try {
    const secret_key = process.env.JWT_Secret_key;
    const { password, userName } = payload;

    //check if any field missing
    if (!(password && userName)) {
      throw new Error("All fields required");
    }

    // Check if the user exists
    const isUser = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE email = ? OR userName = ?",
        [userName, userName],
        (err, row) => {
          if (err) reject(new Error(err));
          if (!row) return reject(new Error("user not exist"));
          resolve(row);
        }
      );
    });

    if (!isUser?.verified) throw new Error("user not verified");

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, isUser.password);
    if (!isMatch) {
      throw new Error("wrong password");
    }

    delete isUser.password;

    // Generate JWT token
    const Tokenpayload = {
      id: isUser?.id,
      email: isUser?.email,
      userName: isUser?.userName,
      verified: isUser?.verified
    };
    const token = jwt.sign(Tokenpayload, secret_key, { expiresIn: "48h" });

    return { token, isUser };
  } catch (error) {
    if (error === "user not exist") throw new Error(error);
    throw new Error(error?.message || "login failed");
  } finally {
    db.close((err) => {
      if (err) console.error("Error closing database connection:", err.message);
    });
  }
};

//send verification email.
export const resendVerificationEmail = async (payload) => {
  const { email } = payload;
  if (!email) throw new Error("Email must be provided");
  try {
    await sendEmail(email, "send verification link");
    return;
  } catch (error) {
    throw new Error(error?.message || "Resend email failed");
  }
};

//verify user.
export const verifyUser = async (payload) => {
  const { verification_token } = payload;
  const emailSecretKey = process.env.Email_Verification_Secret_key;
  const authSecretKey = process.env.JWT_Secret_key;

  // Check if verification token is provided
  if (!verification_token)
    throw new Error("Verification token must be provided");

  const db = new sqlite3.Database("./blog.db");

  try {
    // Decode the verification token
    const decode = jwt.verify(verification_token, emailSecretKey);

    // Retrieve user information from the database
    const userInfo = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE email = ?`,
        [decode.receiver_mail],
        (err, row) => {
          if (err)
            return reject(new Error("Database error while fetching user info"));
          if (!row) return reject(new Error("User not found"));
          resolve(row);
        }
      );
    });

    // Check if the user is already verified
    if (userInfo.verified) throw new Error("User already verified");

    // Update the user's verified status
    const updateVerify = await new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET verified = ? WHERE email = ?`,
        [1, decode.receiver_mail],
        function (err) {
          if (err)
            return reject(
              new Error("Database error while updating verification status")
            );
          resolve(this.changes > 0);
        }
      );
    });

    if (!updateVerify) throw new Error("Failed to update verification status");

    // Remove sensitive information from userInfo
    delete userInfo.password;
    const user = { ...userInfo, verified: 1 };
    const Tokenpayload = {
      id: userInfo?.id,
      email: userInfo?.email,
      userName: userInfo?.userName,
      verified: user?.verified
    }

    // Generate the authentication token
    const token = jwt.sign(Tokenpayload, authSecretKey, { expiresIn: "48h" });

    return { user, token };
  } catch (error) {
    throw new Error(error.message || "Verification failed");
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) console.error("Error closing database connection:", err.message);
    });
  }
};

//update password and send random password to user's email.
export const updatePassword = async (payload) => {
  const { email } = payload;
  if (!email) throw new Error("Email must be provided");
  const db = new Sqlite3.Database("./blog.db");
  const saltRound = Number(process.env.Salt_Round);
  try {
    //check that email registered or not.
    const isUserExist = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject("user not found");
        resolve(row);
      });
    });
    // Generate a secure random password
    const randomPassword = password.randomPassword({
      length: 8,
      characters: [password.lower, password.upper, password.digits],
    });

    const encryptPassword = await bcrypt.hash(randomPassword, saltRound);
    //update on database
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET password = ? , updated_At = CURRENT_TIMESTAMP WHERE email = ?`,
        [encryptPassword, email],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    //send random password to mail
    await sendEmail(email, randomPassword);
    return;
  } catch (error) {
    console.log("from catch", error);
    if (error === "user not found") throw new Error(error);
    throw new Error(error?.message || "Password change failed");
  }
};

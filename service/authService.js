import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Sqlite3 from "sqlite3";
import env from "dotenv";
import { v4 as uuidv4 } from 'uuid';

const sqlite3 = Sqlite3.verbose();
env.config();

export const signupService = async (req, res) => {
  const { userName, email, password } = req.body;
  const secret_key = process.env.SECRET_KEY;

  const saltRounds = 10;
  const db = new sqlite3.Database("./blog.db");
  const O_id = uuidv4()

  try {
    // Check if all required fields are provided
    if (!(userName && email && password)) {
      return res.status(400).json({
        status: 400,
        message: "All fields (userName, email, password) are required",
      });
    }

    const isExist = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE email = ? OR userName = ?",
        [email, userName],
        (err, row) => {
          if (err) {
            reject(err); // SQL query error
          } else {
            resolve(row); // Row will be null if no user exists
          }
        }
      );
    });

    if (isExist) {
      return res.status(400).json({
        message: "Username or Email already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save the new user in the database
    const newUserId = await new Promise((resolve, reject) => {
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

    const payload = {
      id: newUserId.id,
      userName: newUserId.userName,
      email: newUserId.email,
    };

    const token = jwt.sign(
      payload, // Payload with user ID and email
      secret_key, // Secret key
      { expiresIn: "48h" } // Token expiration time
    );

    // Return a successful response with the token
    return res.status(201).json({
      message: "User registered successfully",
      token: token, // Include the JWT token in the response
      data: {
        id: newUserId,
        userName: userName,
        email: email,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  } finally {
    db.close(); // Close the database connection
  }
};

export const loginService = async (req, res) => {
  try {
    const db = new sqlite3.Database("./blog.db");
    const secret_key = process.env.SECRET_KEY;
    const { password, email } = req.body;

    // Check if the user exists
    const isUser = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    if (!isUser) {
      return res
        .status(404)
        .json({ message: "User with this email or username does not exist" });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, isUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const payload = {
      id: isUser.id,
      userName: isUser.userName,
      email: isUser.email,
    };

    const token = jwt.sign(payload, secret_key, { expiresIn: "48h" });

    return res
      .status(200)
      .json({ token, data: payload, message: "login successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred during login", error });
  }
};

export const changePassword = async (req, res) => {
  try {
    const db = new sqlite3.Database("./blog.db");
    const hash = process.env.HASH;
    const { userName, password } = req.body;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, hash);

    // Update the password in the database
    const isUpdate = await new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET password = ? WHERE username = ?`,
        [hashedPassword, userName],
        function (err) {
          if (err) {
            reject(err);
          } else {
            // Check if any rows were affected
            if (this.changes === 0) {
              resolve(false); // No rows were updated
            } else {
              resolve(true); // Row(s) updated successfully
            }
          }
        }
      );
    });

    // Check if the update was successful
    if (!isUpdate) {
      return res
        .status(404)
        .json({ message: "User not found. Enter the correct username." });
    }

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the password" });
  }
};

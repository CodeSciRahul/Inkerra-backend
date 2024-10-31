import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Sqlite3 from "sqlite3";
import env from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { uploadPicOnAws } from "../util/uploadPicOnAws.js";
import { sendEmail } from "../util/sendEmail.js";
import password from "secure-random-password";

const sqlite3 = Sqlite3.verbose();
env.config();

//set user's profile photo or background photo.
export const upload_photo = async (file, tokenInfo) => {
    const db = new sqlite3.Database("./blog.db");
    try {
      if (!file) throw new Error("Profile pic missing");
      const { id } = tokenInfo;
      const url = await uploadPicOnAws(file?.buffer, file.originalname);
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE users SET ${file.fieldname} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? `,
          [url, id],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
      return { profile_pic: url };
    } catch (error) {
      throw new Error(error?.message || "Update failed");
    } finally {
      // Close the database connection
      db.close((err) => {
        if (err) console.error("Error closing database connection:", err.message);
      });
    }
  };

//update user's profile information.
  export const update_profile_info = async (payload, tokenInfo) => {
    const db = new sqlite3.Database("./blog.db");
    try {
      const {
        name,
        address,
        bio,
        instagram,
        twitter,
        facebook,
        linkedin,
        other,
      } = payload;
      const { id } = tokenInfo;
  
      const updateUser = await new Promise((resolve, reject) => {
        db.run(
          `UPDATE users set 
          name = ?, 
          address = ?, 
          bio = ?, 
          instagram = ?, 
          twitter = ?, 
          facebook = ?, 
          linkedin = ?, 
          other = ?,
          updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [name, address, bio, instagram, twitter, facebook, linkedin, other, id],
          (err) => {
            if (err)
              return reject(
                new Error("Database error while updating verification status")
              );
            resolve();
          }
        );
      });
      const user = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
          if (err)
            return reject(new Error("Database error while fetching user info"));
          if (!row) return reject(new Error("No user found"));
          resolve(row);
        });
      });
      delete user.password;
      return user;
    } catch (error) {
      throw new Error(error?.message || "Update Failed");
    } finally {
      db.close((err) => {
        if (err) console.error("Error closing database connection:", err.message);
      });
    }
  };

  //change account password
  export const changePassword = async (payload, tokenInfo) => {
    const db = new sqlite3.Database("./blog.db");
    try {
      const saltRound = Number(process.env.Salt_Round);
      const { current_password, new_password } = payload;
      const { id } = tokenInfo;
  
      //check all value enterd by user or not.
      if (!(current_password && new_password))
        throw new Error("Enter current password and new password");
  
      //reterive password from database
      const old_password = await new Promise((resolve, reject) => {
        db.get(`SELECT password FROM users WHERE id = ?`, [id], (err, row) => {
          if (err) return reject(new Error(err));
          resolve(row);
        });
      });
  
      //check password correct or not.
      const isCorrectPassword = await bcrypt.compare(
        current_password,
        old_password.password
      );
      if (!isCorrectPassword) throw new Error("Wrong Password");
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(new_password, saltRound);
  
      // Update the password in the database
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE users SET password = ? WHERE id = ?`,
          [hashedPassword, id],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
      return;
    } catch (error) {
      throw new Error(error?.message || "chanage Password failed");
    } finally {
      db.close((err) => {
        if (err) console.error("Error closing database connection:", err.message);
      });
    }
  };
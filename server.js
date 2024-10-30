import express from "express";
import bodyparser from "body-parser";
import cors from "cors";
import Sqlite3 from "sqlite3";

import {
  getAllBlog,
  postBlog,
  deleteBlogByUserAndBlogId,
  AllBlogoFUser,
  singleBlogByUserAndBlogId,
  updateBlog,
} from "./service/blogService.js";

import { getSingleUserController } from "./controller/blogController.js";
import { checkToken } from "./middlware/protectedRoute.js";
import { loginController, signupController } from "./controller/authController.js";
import { upload } from "./middlware/multer.js";
import { verifyUserController } from "./controller/authController.js";
import { updatePasswordController } from "./controller/authController.js";
import {resendVerificationEmailController } from "./controller/authController.js";

//update profile import
import { updatePicController,changePasswordController,updateProfileController } from "./controller/userProfileController.js";

const sqlite3 = Sqlite3.verbose();
const port = 3000;

const app = express();

app.use(bodyparser.json());
app.use(cors());

const db = new sqlite3.Database("./blog.db", (err) => {
  if (err) return console.error("error from data base", err);
});

//since posts table already created in which user_id does not exist that is why we first drop the exist table and then recreate
// db.run(`DROP TABLE IF EXISTS posts`);
// db.run(`DROP TABLE IF EXISTS users`);

//table for posts(CRUD) operation
db.run(`CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  blog_pic TEXT DEFAULT NULL,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) 
)`);

//table for user(Authentication) operation
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    userName TEXT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    bio TEXT DEFAULT NULL,
    name TEXT DEFAULT NULL,
    address TEXT DEFAULT NULL,
    profile_pic TEXT DEFAULT NULL,
    background_pic TEXT DEFAULT NULL,
    instagram TEXT DEFAULT NULL,
    twitter TEXT DEFAULT NULL,
    linkedin TEXT DEFAULT NULL,
    facebook TEXT DEFAULT NULL,
    other TEXT DEFAULT NULL,
    verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`,
  (err) => {
    if (err) {
      console.log("error from user table: ", err.message);
      return;
    }
  }
);

app.listen(port, () => {
  console.log("server is runing on port 3000");
});

//different route for authentication
app.post("/api/auth/signup", signupController);
app.post("/api/auth/login", loginController);
app.post("/api/auth/verification-email", resendVerificationEmailController);
app.patch("/api/auth/verify-account", verifyUserController);            
app.patch("/api/auth/reset-password", updatePasswordController);   

// User profile routes
app.put("/api/user/profile", checkToken, updateProfileController);
app.patch("/api/user/profile-picture", checkToken, upload.single('profile_pic'), updatePicController);
app.patch("/api/user/background-picture", checkToken, upload.single('background_pic'), updatePicController);
app.patch("/api/user/change-password", checkToken, changePasswordController);


//different route for CRUD Operation
// Blog routes
app.post("/api/blog", checkToken,upload.single('blog_pic'),postBlog);
app.get("/api/blogs", getAllBlog);                              
app.get("/api/user/:user_id/blogs", checkToken, AllBlogoFUser);  
app.get("/api/user/:user_id/blog/:blog_id", singleBlogByUserAndBlogId); 
app.patch("/api/blog/:blog_id", checkToken, updateBlog);         
app.delete("/api/blog/:blog_id", checkToken, deleteBlogByUserAndBlogId); 
app.get("/api/user/:user_id", checkToken, getSingleUserController);


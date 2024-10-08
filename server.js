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
} from "./service/crudService.js";
import {
  signupService,
  loginService,
  changePassword,
} from "./service/authService.js";
import { getSingleUserController } from "./controller/crudController.js";
import { checkToken } from "./middlware/protectedRoute.js";

const sqlite3 = Sqlite3.verbose();
const port = 3000;

const app = express();
//Middlware

app.use(bodyparser.json());
app.use(cors());

const db = new sqlite3.Database("./blog.db", (err) => {
  if (err) return console.error("error from data base", err);
});

// //since posts table already created in which user_id does not exist that is why we first drop the exist table and then recreate
// db.run(`DROP TABLE IF EXISTS posts`);
// db.run(`DROP TABLE IF EXISTS users`);

//table for posts(CRUD) operation
db.run(`CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) 
)`);

// Create a trigger to update 'updated_at' whenever a row in 'posts' is updated
// db.run(`CREATE TRIGGER IF NOT EXISTS update_timestamp
//   AFTER UPDATE ON posts
//   FOR EACH ROW
//   BEGIN
//       UPDATE posts
//       SET updated_at = CURRENT_TIMESTAMP
//       WHERE id = old.id;
//   END;
// `);

//table for user(Authentication) operation
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    userName TEXT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
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

// // Create a trigger to update 'updated_at' whenever a row in 'users' is updated
// db.run(`CREATE TRIGGER IF NOT EXISTS update_timestamp
//   AFTER UPDATE ON users
//   FOR EACH ROW
//   BEGIN
//       UPDATE users
//       SET updated_at = CURRENT_TIMESTAMP
//       WHERE id = old.id;
//   END;
// `);

app.listen(port, () => {
  console.log("server is runing on port 3000");
});

//different route for authentication
app.post("/api/auth/createAccount", signupService);
app.post("/api/auth/login", loginService);
app.patch("/api/auth/updatePassword", changePassword);

//different route for CRUD Operation
app.post("/api/:user_id", checkToken, postBlog);
app.get("/api/blog", getAllBlog);
app.get("/api/:user_id", checkToken, AllBlogoFUser);
app.get("/api/:user_id/:blog_id", singleBlogByUserAndBlogId);
app.patch("/api/:user_id/:blog_id", checkToken, updateBlog);
app.delete("/api/:user_id/:blog_id", checkToken, deleteBlogByUserAndBlogId);

app.get("/api/v/user/:user_id", checkToken, getSingleUserController);

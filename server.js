import express from 'express'
import bodyparser from "body-parser"
import cors from "cors"
import Sqlite3 from "sqlite3";

import { getAllBlog,postBlog,deleteBlogByUserAndBlogId,AllBlogoFUser, singleBlogByUserAndBlogId,updateBlog } from './service/crudService.js';
import { signupService,loginService,changePassword } from './service/authService.js';
import { checkToken } from './middlware/protectedRoute.js';


const sqlite3 = Sqlite3.verbose();

const app = express()

//Middlware

app.use(bodyparser.json());
app.use(cors());

const db = new sqlite3.Database('./blog.db', (err) => {
    if(err) return console.error("error from data base", err)
})

//since posts table already created in which user_id does not exist that is why we first drop the exist table and then recreate
// db.run(`DROP TABLE IF EXISTS posts;`);


//table for posts(CRUD) operation
db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
)`);


//table for user(Authentication) operation
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userName TEXT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
)`);

app.listen(3000);


//different route for authentication
app.post('/api/auth/createAccount',signupService);
app.post('/api/auth/login', loginService)
app.patch('/api/auth/updatePassword',changePassword)


//different route for CRUD Operation
app.post('/api/:user_id',checkToken,postBlog);
app.get('/api/blog',getAllBlog);
app.get('/api/:user_id', checkToken, AllBlogoFUser);
app.get('/api/:user_id/:blog_id',singleBlogByUserAndBlogId);
app.patch('/api/:user_id/:blog_id',checkToken,updateBlog);
app.delete('/api/:user_id/:blog_id',checkToken,deleteBlogByUserAndBlogId);
import Sqlite3 from "sqlite3";
const sqlite3 = Sqlite3.verbose();

const db = new sqlite3.Database("./blog.db");


export const getUser = async(payload) => {
    const {user_id} = payload

   const user = await new Promise((resolve, reject) => {
     db.get(`SELECT * FROM users WHERE id = ?`, [user_id], (err,row) => {
        if(err) reject(err);
       else resolve(row)
     })
   }) 

   const blogs = await new Promise((resolve, reject) => {
    db.all(`SELECT * FROM posts WHERE user_id = ?`, [user_id], (err,row) => {
       if(err) reject(err);
      else resolve(row)
    })
  }) 

   if(!user) throw new Error("user not found");
   delete user.password
   return {
    user, blogs};
}

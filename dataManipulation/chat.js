import Sqlite3 from "sqlite3";

const sqlite3 = Sqlite3.verbose();

const db = new sqlite3.Database("./blog.db");


export const getUser = async(payload) => {
    const {user_id} = payload
    const user = await new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM chats WHERE user_id = ?", 
          [user_id],
          (err, row) => {
            if (err) {
              reject(err);  
            } else {
              resolve(row); 
            }
          }
        );
      });
      console.log(user);
    return user;
}
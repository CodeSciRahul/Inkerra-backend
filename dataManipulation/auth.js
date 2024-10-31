import Sqlite3 from "sqlite3";
import { updateProfile } from "../util/updateProfile";

const sqlite3 = Sqlite3.verbose();

const db = new sqlite3.Database("./blog.db")

export const updateUserProfile = (payload) => {
    
}

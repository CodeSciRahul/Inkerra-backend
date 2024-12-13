import sqlite from "sqlite3";

const sqlite3 = sqlite.verbose();
export const getPaginationResult = async (pageNo, limit) => {
  const db = new sqlite3.Database("./blog.db");
  try {
    //    Pagination: Retrieve the 4th page of data with 10 items per page.
    // -- OFFSET calculates how many rows to skip: (page_number - 1) * page_size.
    // -- For page 4, this skips the first 30 rows, returning rows 31–40.
    const offset = (pageNo - 1) * limit;
    const sqlCmd = `
SELECT 
    p.*, 
    u.userName, 
    u.email, 
    u.address, 
    u.profile_pic, 
    u.name
FROM 
    posts AS p
INNER JOIN 
    users AS u 
ON 
    p.userName = u.userName
LIMIT ? OFFSET ?;
        `;

    const data = await new Promise((resolve, reject) => {
      db.all(sqlCmd, [limit, offset], (err, rows) => {
        if (err) {
          return reject(new Error(err?.message));
        }

        const transformedData = rows?.map((row) => ({
          user: {
            userName: row.userName,
            email: row.email,
            address: row.address,
            profile_pic: row.profile_pic,
            name: row.name,
          },
          post: {
            id: row.id,
            title: row.title,
            content: row.content,
            blog_pic: row.blog_pic,
            created_at: row.created_at,
            updated_at: row.updated_at,
          },
        }));
        resolve(transformedData);
      });
    });
    const total_posts = await new Promise((resolve, reject) => {
      const sqlCmd = `
            SELECT COUNT(*) AS total FROM posts
            `;
      db.get(sqlCmd, (err, row) => {
        if (err) return reject(new Error(err?.message));
        resolve(row.total);
      });
    });
    const total_pages = Math.ceil(total_posts / limit);
    const next_page =
      Number(pageNo) + 1 > total_pages ? null : Number(pageNo) + 1;
    const prev_page = Number(pageNo) - 1 <= 0 ? null : Number(pageNo) - 1;

    const pagination = {
      total_posts,
      current_page: Number(pageNo),
      total_pages,
      next_page,
      prev_page,
    };
    return { data, pagination };
  } catch (error) {
    console.log(error);
    throw new Error(error?.message);
  }
};

import Sqlite3 from "sqlite3";
import { v4 as uuidv4 } from 'uuid';

const sqlite3 = Sqlite3.verbose();

const db = new sqlite3.Database("./blog.db");

// Create a new blog post.
export const postBlog = async (req, res) => {
    try {
      const user_id = req.params.user_id;
      const O_id = uuidv4();
      console.log("string uniqe id from crud",O_id);

      const { title, content } = req.body;
  
      // Check if title and content are provided
      if (!(title && content)) {
        return res.status(400).send({ message: "Title and content are required" });
      }
  
      // Insert the new blog post
      const newPostId = await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO posts (id, user_id, title, content) VALUES (?, ?, ?, ?)",
          [O_id, user_id, title, content],
          function (err) {
            if (err) {
              reject(err);  // Handle the error
            } else {
              resolve(this.lastID);  // Get the last inserted ID
            }
          }
        );
      });
  
      // Retrieve the newly created blog post
      const newPost = await new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM posts WHERE id = ?",
          [newPostId],
          (err, row) => {
            if (err) {
              reject(err);  // Handle the error
            } else {
              resolve(row);  // Return the complete post data
            }
          }
        );
      });
  
      // Send the full blog post data in the response
      return res.status(201).send({
        message: "Blog post created successfully",
        data: newPost,
      });
  
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        error: error?.message,
      });
    }
  };
  

// Retrieve all blog posts.
export const getAllBlog = async (req, res) => {
    try {
      const posts = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM posts", (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
  
      if (!posts || posts.length === 0) {
        return res.status(404).send({
          message: "No posts found",
          data: [],
        });
      }
  
      return res.status(200).send({
        message: "All posts retrieved successfully",
        data: posts,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        error: error?.message,
        data: null,
      });
    }
};
  

//Retrieve all  blog for specific user
export const AllBlogoFUser = async (req, res) => {
    try {
      const user_id = req.params.user_id;
  
      const posts = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM posts WHERE user_id = ?", [user_id], (err, rows) => {  // Use `db.all` to get all rows
          if (err) {
            reject(err);
          } else {
            resolve(rows);  // `rows` contains all posts as an array
          }
        });
      });
  
      if (posts.length === 0) {
        return res.status(404).send({ message: "No posts found for this user" });
      }
  
      return res.status(200).send({
        message: "Blogs retrieved successfully",
        data: posts,  // Send all posts as an array
      });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        error: error?.message,
      });
    }
};
  

//reterive single blog for specific user and specific blog by blog id
export const singleBlogByUserAndBlogId = async (req, res) => {
    try {
        const { user_id, blog_id } = req.params
    
        const post = await new Promise((resolve, reject) => {
          db.get(
            "SELECT * FROM posts WHERE user_id = ? AND id = ?", 
            [user_id, blog_id],
            (err, row) => {
              if (err) {
                reject(err);  
              } else {
                resolve(row); 
              }
            }
          );
        });
    
        if (!post) {
          return res.status(404).send({
            message: "Post not found for the given user and blog id",
          });
        }
    
        return res.status(200).send({
          message: "Blog retrieved successfully",
          data: post,
        });
      } catch (error) {
        return res.status(500).send({
          message: "Internal server error",
          error: error?.message,
        });
      }
    };


//Delete a blog post by ID.
export const deleteBlogByUserAndBlogId = async (req, res) => {
    try {
      const { user_id, blog_id } = req.params; 
  
      const deleteBlog = await new Promise((resolve, reject) => {
        db.run(
          "DELETE FROM posts WHERE id = ? AND user_id = ?", 
          [blog_id, user_id],
          function (err) {
            if (err) {
              reject(err); 
            } else {
              resolve({ changes: this.changes }); 
            }
          }
        );
      });
  
      if (deleteBlog.changes === 0) {
        return res.status(404).send({
          message: "Blog not found or not deleted",
        });
      }
  
      return res.status(200).send({
        message: "Blog deleted successfully",
      });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        error: error?.message,
      });
    }
  };

//editing of existing posts.
export const updateBlog = async (req, res) => {
    const db = new sqlite3.Database("./blog.db"); // Ensure you have your database connection
    try {
      const { user_id, blog_id } = req.params; // Destructure user_id and blog_id from params
      const { title, content } = req.body; // Get title and content from the request body
  
      // Check if at least one of title or content is provided
      if (!(title || content)) {
        return res.status(400).send({ message: "Title or content is required to update" });
      }
  
      // Construct dynamic query parts for the fields to update
      let query = "UPDATE posts SET ";
      let queryParams = [];
  
      if (title) {
        query += "title = ?";
        queryParams.push(title);
      }
      if (content) {
        if (queryParams.length > 0) query += ", "; // Add a comma if title is also being updated
        query += "content = ?";
        queryParams.push(content);
      }
  
      // Add the WHERE clause to target the specific post by blog_id and user_id
      query += " WHERE id = ? AND user_id = ?";
      queryParams.push(blog_id, user_id);
  
      // Execute the update query
      const result = await new Promise((resolve, reject) => {
        db.run(query, queryParams, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        });
      });
  
      // If no rows were updated, return a 404 (blog not found or not belonging to the user)
      if (result.changes === 0) {
        return res.status(404).send({
          message: "Blog not found or not updated",
        });
      }
  
      // Fetch the updated blog
      const updatedBlog = await new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM posts WHERE id = ? AND user_id = ?",
          [blog_id, user_id],
          (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          }
        );
      });
  
      // Return the updated blog
      return res.status(200).send({
        message: "Blog updated successfully",
        data: updatedBlog,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        error: error?.message,
      });
    }
};

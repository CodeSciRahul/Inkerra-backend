# Node.js API Project

This project is built using **Node.js** and **Express.js**, with **SQLite** as the database and **AWS S3** for image uploads. The project also incorporates **Nodemailer** for email functionality and **JWT** for authentication and authorization.

#live Url
https://inkerra-backend.onrender.com/

## Features
- User authentication and authorization (signup, login, email verification, password reset).
- User profile management (update profile, change profile and background pictures).
- Blog CRUD operations (create, read, update, delete).
- Secure image uploads using AWS S3.
- JWT-based token authentication for secure API endpoints.

---

## API Endpoints

### Authentication Routes

1. **Signup**  
   **POST** `/api/auth/signup`  
   Description: Registers a new user.  
   
2. **Login**  
   **POST** `/api/auth/login`  
   Description: Logs in an existing user.  
   
3. **Resend Verification Email**  
   **POST** `/api/auth/verification-email`  
   Description: Sends a new account verification email.  
   
4. **Verify Account**  
   **PATCH** `/api/auth/verify-account`  
   Description: Verifies the user's account using a token.  
   
5. **Reset Password**  
   **PATCH** `/api/auth/reset-password`  
   Description: Updates the user's password.

---

### User Profile Routes

1. **Update Profile**  
   **PUT** `/api/user/profile`  
   Description: Updates the user's profile information. Requires token authentication.  

2. **Update Profile Picture**  
   **PATCH** `/api/user/profile-picture`  
   Description: Updates the user's profile picture. Requires token authentication. Accepts a file named `profile_pic`.  

3. **Update Background Picture**  
   **PATCH** `/api/user/background-picture`  
   Description: Updates the user's background picture. Requires token authentication. Accepts a file named `background_pic`.  

4. **Change Password**  
   **PATCH** `/api/user/change-password`  
   Description: Allows the user to change their password. Requires token authentication.

---

### Blog Routes

1. **Create a Blog**  
   **POST** `/api/blog`  
   Description: Creates a new blog. Requires token authentication. Accepts a file named `blog_pic`.  

2. **Get All Blogs**  
   **GET** `/api/blogs`  
   Description: Retrieves all blogs.  

3. **Get All Blogs by User**  
   **GET** `/api/user/:userName/blogs`  
   Description: Retrieves all blogs created by a specific user. Requires token authentication.  

4. **Get Single Blog by User and Title**  
   **GET** `/api/user/:userName/blog/:title`  
   Description: Retrieves a single blog by user and title.  

5. **Update Blog**  
   **PATCH** `/api/blog/:blog_id`  
   Description: Updates an existing blog. Requires token authentication.  

6. **Delete Blog**  
   **DELETE** `/api/blog/:blog_id`  
   Description: Deletes a blog by its ID. Requires token authentication.  

7. **Get Single User**  
   **GET** `/api/user/:userName`  
   Description: Retrieves details of a specific user. Requires token authentication.

---

## Technologies Used
- **Node.js** for server-side scripting.
- **Express.js** for building the API.
- **SQLite** as the database for data storage.
- **AWS S3** for secure image uploads.
- **Nodemailer** for sending emails.
- **JWT** for user authentication and authorization.

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   ```

2. Navigate to the project directory:
   ```bash
   cd <project_directory>
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory and configure the following variables:
   ```env
   Access_key = AKIAWAA66JUOT2TDSOWS
Secret_key = 
Bucket_Name = 
Region = 
JWT_Secret_key = 
App_password = 
Sender_email =
Frontend_url = 
Email_Verification_Secret_key = 
Salt_Round = 
   ```

5. Run the server:
   ```bash
   npm start
   ```

---

## License
This project is licensed under the MIT License. Feel free to use and modify it as needed.

---

## Contribution
Contributions are welcome! Feel free to submit a pull request or report issues.

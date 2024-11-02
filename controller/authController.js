import { verifyUser } from "../service/authService.js";
import { updatePassword, resendVerificationEmail,signupService, loginService } from "../service/authService.js";

export const verifyUserController = async (req, res) => {
  try {
    const { user, token } = await verifyUser(req.body);
    return res.status(200).send({
      data: user,
      token,
      message: "User verified successfully"
    });
  } catch (error) {
    const statusCode = error.message === "Verification token must be provided" ||
                       error.message === "Invalid or expired token" ||
                       error.message === "User already verified" ||
                       error.message === "Failed to update verification status"
                       ? 400 : 500;

    return res.status(statusCode).send({
      message: error.message || "Internal server error"
    });
  }
};

export const updatePasswordController = async(req,res) => {
  try {
    await updatePassword(req.body);
    return res.status(200).send({
      message: "New temporary password send to your registered email"
    })
  } catch (error) {
    const statusCode = error?.message === "Email must be provided" || 
                       error?.message === "user not found" 
                       ? 400 : 500
    return res.status(statusCode).send({
      message: error?.message
    })
  }
}

export const resendVerificationEmailController = async(req,res) => {
  try {
    await resendVerificationEmail(req.body)
    return res.status(200).send({
      message: "Verification email successfully sent"
    })
  } catch (error) {
    const statusCode = error?.message === "Email must be provided" ? 400 : 500
    if(statusCode === 400) {
      return res.status(400).send({
        message: error?.message
      })
    }
    return res.status(statusCode).send({
      message: "Internal server error",
      error: error?.message
    })
  }
}

export const signupController = async(req,res) => {
  try {
   await signupService(req.body)
   return res.status(200).send({
    message: "Verification email successfully sent to your registered email"
   })
  } catch (error) {
    const statusCode = error?.message === "All field are required" || 
                       error?.message === "username or email already exist" ? 400 : 500
    if(statusCode === 400) {
      return res.status(statusCode).send({
        message: error?.message
      })
    }
    return res.status(statusCode).send({
      message: "Internal server error",
      error: error?.message
    })
    }
}

export const loginController = async(req,res) => {
  try {
    const {isUser, token} = await loginService(req.body)
    return res.status(200).send({
      data: isUser,
      token,
      message: "login successfull"
    })
  } catch (error) {
    const statusCode = error?.message === "All fields required" || "user not exist" || "user not verified" || "wrong password" ? 400 : 500
    
    if(statusCode === 400){
      return res.status(statusCode).send({
        message: error?.message
      })
    }
    return res.status(statusCode).send({
      message: "Internal server error",
      error: error?.message
    })
  }
}
import { upload_photo,changePassword,update_profile_info } from "../service/userProfileService.js"

export const updatePicController = async(req, res) => {
    try {
        const updatProfile = await upload_photo(req.file, req.user)
        return res.status(200).send({
            data: updatProfile,
            message: "Profile Pic updated successfully"
        })
    } catch (error) {
        const statusCode = error?.message === "Profile pic missing" ? 400 : 500
        console.log("from controller", error);
        return res.status(statusCode).send({
            message: error?.message,
        })
    }

}

export const updateProfileController = async(req, res) => {
    try {
        const user = await update_profile_info(req.body, req.user);
        return res.status(200).send({
            data: user,
            message: "Profile Update successfully"
        })
    } catch (error) {
        const statusCode = 
                           error?.message === "No user found" ? 400 : 500
        return res.status(statusCode).send({
            message: error?.message
        })
    }

}

export const changePasswordController = async(req,res) => {
    try {
      await changePassword(req.body, req.user)
      return res.status(200).send({
        message: "Password update successfully"
      })
    } catch (error) {
      const statusCode = error?.message === "Wrong Password" ||
                         error?.message === "Enter current password and new password" ?
                         400 : 500;
  
      if(statusCode === 400) {
        return res.status(statusCode).send({
          message: error?.message
        })
      }
      return res.status(statusCode).send({
        message: "Internal Server Error",
        error: error?.message
      })
    }
}
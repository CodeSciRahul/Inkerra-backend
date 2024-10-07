import { chatService } from "../service/chatService.js";

const chatservice = new chatService();

export const getUserController = async(req,res) => {
    try {
        const user = chatservice.getUser(req.params);
        console.log(req.params)
        return res.status(200).send({
            data: user,
            message: "receiver detail get successfully"
        })
        
    } catch (error) {
        return res.status(500).send({
            message: "Internal server Error",
            error: error?.message
        })
    }

}
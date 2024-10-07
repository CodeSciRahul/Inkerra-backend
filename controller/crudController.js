import { crudService } from "../service/crudService.js";

const crudservice = new crudService();

export const getSingleUserController = async(req,res) => {
    try {
        const {user, blogs} = await crudservice.getuserService(req.params);
        return res.status(200).send({
            data: user,
            posts: blogs,
            message: "user detail get successfully"
        })
    } catch (error) {
        if(error?.message === "user not found") {
            return res.status(400).send({
                message: error.message
            })
        }

        return res.status(500).send({
            message: "Internal server Error",
            error: error?.message
        })
    }

}
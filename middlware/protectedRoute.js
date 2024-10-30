import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();

export const checkToken = async(req,res,next) => {
    const secret_key = process.env.JWT_Secret_key;
    const token = req.header('Authorization')?.split(" ")[1]
    if(!token) return res.status(400).send({
        message: "jwt must be provided"
    })

    try {
        const decode = jwt.verify(token, secret_key); //it will decode the token with the help of secret key and extract info of user which save in payload during generate token.
        req.user = decode 
        next()
    } catch (error) {
        res.status(401).json({ message: 'Invalied or Expire token', error });
    }

}
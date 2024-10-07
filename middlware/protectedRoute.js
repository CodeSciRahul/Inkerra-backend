import jwt from "jsonwebtoken"

export const checkToken = async(req,res,next) => {
    const secret_key = "rahulmanishaadityaaman@8252985116";
    const token = req.header('Authorization')?.split(" ")[1]
    if(!token) res.status(400).send({
        message: "Authorization Denied"
    })

    try {
        const decode = jwt.verify(token, secret_key);
        req.user = decode
        next()
    } catch (error) {
        res.status(401).json({ message: 'Invalied or Expire token' });
    }

}
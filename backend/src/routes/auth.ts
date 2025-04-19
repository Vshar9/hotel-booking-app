import express,{Request,Response,RequestHandler} from "express";
import {check,validationResult} from "express-validator";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/auth";

const router = express.Router();

const loginHandler : RequestHandler = async (req : Request, res: Response)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({
            message: errors.array()
        });
        return;
    }

    const {email,password} = req.body;
    try{
        const user = await User.findOne({
            email
        });

        if(!user){
            res.status(400).json({
                message: "Invalid Credentials"
            })
            return;
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            res.status(400).json({
                message: "Invalid Credentials"
            })
            return;
        }

        const token = jwt.sign({userId: user._id},process.env.JWT_SECRET_KEY as string,{
            expiresIn: "1d",
        });

        res.cookie("auth_token",token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24*60*60*1000,
        })
        
        res.status(200).json({userId: user._id})
    } catch(error){
        console.log(error);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

router.post("/login",[
    check("email","Email is required").isEmail(),
    check("password","Password is required").notEmpty()
], loginHandler);

const tokenValidationHandler : RequestHandler = async (req: Request,res: Response) => {
    res.status(200).send({userId: req.userId});
}



router.get("/validate-token",verifyToken,tokenValidationHandler)

///

const logoutHandler : RequestHandler = async (req: Request,res: Response) => {
    res.cookie("auth_token","",{
        expires: new Date(0),
    });
    res.send();
};

router.post("/logout",logoutHandler)
export default router;
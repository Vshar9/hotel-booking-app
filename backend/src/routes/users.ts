import express, { Request, Response, RequestHandler } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";

const router = express.Router();

const userDataFetch: RequestHandler = async(req: Request,res: Response)=>{
    const userId = req.userId;
    try{
        const user = await User.findById(userId).select("-password")
        if(!user){
            res.status(400).json({message: "User not found"});
            return;
        }
        res.json(user);
    }catch(error){
        console.log(error);
        res.status(500).json({message: "Something went wrong"})
    }
}

router.get("/me",verifyToken, userDataFetch)

const registerUserHandler: RequestHandler = async (req: Request, res: Response)=> {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ message: errors.array() });
        return;
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            res.status(400).json({
                message: "User already exists"
            });
            return; // Explicitly return here
        }

        // Create a new user
        user = new User(req.body);
        await user.save();

        // Create a JWT token
        const token = jwt.sign({ userId: user._id },
            process.env.JWT_SECRET_KEY as string,
            { expiresIn: "1d" }
        );

        // Set token in cookies
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        // Send response
        res.status(200).send({ message: "User registered successfully" });

    } catch (error) {
        console.log("Error during user registration:", error);
        res.status(500).send({
            message: "Something went wrong on the server side"
        });
    }
}

// POST route to register user
router.post("/register", [
    check("firstName", "First Name is required").isLength({
        min: 3
    }).isString(),
    check("lastName", "Last Name is required").isLength({
        min: 3
    }).isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password is required with 6 or more characters").isLength({ min: 6 }),
], registerUserHandler);

export default router;

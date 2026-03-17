import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        
       const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") // access token
        
       if(!token){
        throw new ApiError(401, "Unauthorized request")
       }

       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)//decoded token milgya h ab user ki details nikal lenge

      const user = await User.findById(decodedToken?._id).select("-password -refreshToken")// fetching details of user excluding pass. and r token
       // console.log( "yooo", user);
       
       if(!user){
        throw new ApiError(401, "Invalid Access Token")
       }

       req.user = user;
       next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})


/*
Ye code basically ek Security Guard (Middleware) hai jo check karta hai ki user logged in hai ya nahi before letting them access specific routes. 🛡️

Kaam ki Summary:
Token Extraction: Sabse pehle ye cookies ya Authorization header se Access Token nikalta hai. 🔍

Verification: jwt.verify use karke ye check karta hai ki token valid hai aur tamper toh nahi kiya gaya (using your secret key). ✅

User Fetching: Token valid hone par, ye database se user ki details nikalta hai. Security ke liye password aur refreshToken ko exclude kar deta hai. 🚫🔑

Request Injection: User ka sara data req.user mein daal deta hai taaki aage ke functions/controllers use kar sakein. 📥

Next Step: Agar sab sahi hai, toh next() call karke control agle function ko bhej deta hai. 🏃‍♂️

⚠️ Important Fixes (Pro-tip):
Aapke code mein ek-do minor issues hain jo runtime par error de sakte hain:

Missing await: Line 14 mein User.findById ke pehle await lagana zaruri hai, kyunki ye database call hai.

const user = await User.findById(decodedToken?._id)...

Bearer Space: Header replace karte waqt "Bearer " (with space) use karein, varna token ke aage extra space reh jayegi.

.replace("Bearer ", "")

*/
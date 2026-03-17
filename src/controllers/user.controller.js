import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessTokenAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken 
        await user.save({validateBeforeSave: false})// validateBeforeSave false

        //we have generated both tokens and saved the refresh token in DB

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for image and avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in DB
    // remove password and refresh token field from response
    // check for user creation 
    // return response 



const {fullName, email, username, password} = req.body; 
   console.log('email: ', email); // email aa rha h json format me bheja h from postman
    
                    // checking fields
    /* if(fullName === ""){
        throw new ApiError(400, "FULLNAME IS REQUIRED")
   }
        a simple checking condn
        */

    if(
    [fullName, email, username, password].some((x) => x?.trim() === "")
    ){
        throw ApiError(400, "ALL FIELDS ARE REQUIRED")
    }


const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })// we used or operator here to find the user


    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    //hume middleware add kia tha for file handling multer k through.. multer req. me or fields add kr deta h 

const avatarLocalPath = req.files?.avatar[0]?.path;
    //"Jo file user ne upload ki hai, uska computer (server) pe path (location) nikal lo."

//const imageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    } 

    // imageLocalPath iska path bhi lelia jo comp. pe rkha hua h

    //avatar ka local path mil gya h ya yhi check krlia
    if(!avatarLocalPath) {
        throw new ApiError(400, "AVATAR FILE IS REQUIRED")
    }

    // a sample controller function using asyncHandler

// cloudinary p uoload krke url lelia
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   //  console.log("Files: ", req.files); iska mtlb dekhna h

    if(!avatar){
        throw new ApiError(400,"AVATAR FILE IS REQUIRED")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    ) // response bhej dia

})

const loginUser = asyncHandler(async(req, res) => {
    // req body se data le aao
    // username or email
    // find the user 
    // password check
    // access and refresh token
    // send cookie

    const {email, username, password} = req.body // req body se le liye ye sb

    if(!(username || email)){ // (!username && !email) aise bhi likh skte h 
        throw new ApiError(400, "USERNAME OR EMAIL IS REQUIRED")
    } 

    const user = await User.findOne({
        $or: [{username}, {email}]
    }) //finding user in DB

    if(!user){
        throw new ApiResponse(404, "USER DOES NOT EXIST WITH THIS USERNAME/EMAIL")
    }

    const isPasswordValid = await user.comparePassword(password)//we used user here not User... (we wrote compare password not is pass.correct in user model)

    if(!isPasswordValid){
        throw new ApiError(401, "INVALID USER CREDENTIALS")
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secre: true
    }

    return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            'User loggedIn Successfully'
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {refreshToken: 1}// this removes the field from document
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }

    // we have recived incomingRefreshToken
try {
    
    const decodedToken = jwt.verify(
        incomingRefreshToken, 
        process.env.REFRESH_TOKEN_SECRET)//decoded token

    const user = await  User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid Refresh Token")
    }

    // now we have got the user

    if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
        httpOnly: true,
        secure: true
    }
    
        // now we'll generate new tokens
    
    const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    // now return the response

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {accessToken, refreshToken: newRefreshToken},
            "Access Token Refreshed"
        )
    )
    } catch (error) {
          throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    // get old password and new password from req body
    // check if old password is correct or not
    // if correct then update with new password
    // remove refresh token and access token from response
    // send response

    const{oldPassword, newPassword} = req.body

    //req.user se hum user bhi le skte.. route me middleware kr add kr denge

    const user = await User.findById(req.user?._id)

    const check = await user.comparePassword(oldPassword)

    if(!check){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})
 
    return res
    .status(200)
    .clearCookie("accessToken", options) // Browser se token delete
    .clearCookie("refreshToken", options) // Refresh token bhi delete
    .json(new ApiResponse(200, {}, "Password changed & logged out!"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'current user fetched successfully'))
})// we are adding verifyJWT middleware so we can fetch user from req.user

const updateAccountDetails = asyncHandler(async() => {

    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, 'All Fields are Required')
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName, email
        }
    }, {new: true}// updated document return krne ke liye
  ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"))

})

const updateUserAvatar = asyncHandler(async() => {
    
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url
        }
    },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, 'Avatar Image Updated Successfully')
    )
})

const updateCoverImage = asyncHandler(async() => {
    
    const coverImageLocalPath = req.file?._path
    if(!coverImageLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: coverImage.url
        }
    },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, 'Cover Image Updated Successfully')
    )
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username}= req.params

    if(!username?.trim()){
        throw new ApiError(400, "Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo" 
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                             if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                             then: true,
                             else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ]) 

    if(!channel || channel.length === 0){
        throw new ApiError(404, "Channel not found with this username")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    )

})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },

        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline :[ {
                                $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                } 
                            }
                            ]
                        }
                    },
                    {
                        $addFields: {
                        owner: {
                            first: "$owner"
                        }
                    }
                }
                ]
            }
        }


    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory,
        "User watch history fetched successfully"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
};



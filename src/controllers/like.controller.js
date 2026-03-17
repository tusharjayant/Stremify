import mongoose from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async(req, res) => {

        const {videoId} = req.params;
        if(!mongoose.isValidObjectId(videoId)){
            throw new ApiError(400, "Invalid Video ID")
        }

        //check if liked already
        const liked = await Like.findOne({
            video: videoId,
            likedBy: req.user._id
        });

        if(!liked){ // create like
            await Like.create({video: videoId, likedBy: req.user._id})
            return res
                .status(200)
                .json(new ApiResponse(200, {isLiked: true}));
        }

        // delete like
        //await Like.findByIdAndDelete(liked._id); it will go in DB again and delete the like

        // instead we can directly delete the like without going to DB again
        await liked.deleteOne();

        return res
            .status(200)
            .json(new ApiResponse(200, {isLiked: false}))
})

const toggleCommentLike = asyncHandler(async(req, res) => {
    const {commentId} = req.params;
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError (400, "Invalid Comment ID")
    }

    const liked = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if(!liked){
        await Like.create({
            comment: commentId, // schema me field name comment hai, isliye comment: commentId
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(new ApiResponse(200, {isLiked: true}, "Comment liked"))
    }

    await liked.deleteOne();
    return res
        .status(200)
        .json(new ApiResponse(200, {isLiked: false}, "Comment unliked"))
    
})

const toggleTweetLike = asyncHandler(async(req, res) => {
    const {tweetId} = req.params;
    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError (400, "Invalid Tweet ID")
    }

    const liked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if(!liked){
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(new ApiResponse(200, {isLiked: true}, "Tweet liked"))
    }

    await liked.deleteOne();
    return res
        .status(200)
        .json(new ApiResponse(200, {isLiked: false}, "Tweet unliked"))
    
})

const getLikedVideos = asyncHandler(async(req, res) => {

    const likedVideos = await Like.find({likedBy: req.user._id,
        video: { $exists: true }
    }).populate({
        path: "video",
        populate: {
            path: "owner",
            select: "fullName username avatar" //only select these fields from the owner
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully!"))
})


export {
    toggleVideoLike,
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike
}

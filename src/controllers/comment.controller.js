import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const addComment = asyncHandler(async(req, res) => {

    const {videoId} = req.params;
    const {content} = req.body;

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id //we will add a midlleware to authenticate the user and set req.user
    })

    if(!comment) {
        throw new ApiError(500, "Failed to add comment")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"))
})  

const updateComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params;

    //validate comment ID
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    const content = req.body.content;

    //check if content is provided and not empty
    if(!content || content.trim() === ""){
        throw new ApiError(400, "Content is required")
    }

    const updatedComment = await Comment.findOneAndUpdate({
        _id: commentId,
        owner: req.user._id //we have to make sure that the user can only update their own comment
    },{
        content
    },{
        new: true
    })

    if(!updatedComment){
        throw new ApiError(404, "Comment not found or you are not authorized to update this comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params;

    //validate comment ID
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id //we have to make sure that the user can only delete their own comment
    })

    if(!deletedComment){
        throw new ApiError(404, "Comment not found or you are not authorized to delete this comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"))
    
})

const getVideoComments = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;//default values for page and limit

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }
/*
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: {createdAt: -1}, //sort by createdAt in descending order
        populate: {
            path: "owner",
            select: "fullName username avatar" //we only want to return the fullName, username and avatar of the owner
        }
    }
*/

// less shift to pipline

   const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
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
                owner: { $first: "$owner" }
            }
        }
    ]);

   const comments = await Comment.aggregatePaginate(aggregate, {
        page: parseInt(page),
        limit: parseInt(limit)
    });

    return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

export {
    addComment,
    updateComment,
    deleteComment,
    getVideoComments
}
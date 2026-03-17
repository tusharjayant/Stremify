import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async(req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId} = req.query;

    const pipeline = [];

    if(query){
       pipeline.push({
        $match: {
            $or: [
                {title: {$regex: query, $options: "i"}},
                {description: {$regex: query, $options: "i"}}
            ]
        }
       })
    }
    // User Filter Logic 
    if(userId){
        if(!mongoose.isValidObjectId(userId)){
            throw new ApiError(400, "Invalid User Id");
        }
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    pipeline.push({
        $match: {
            isPublished: true
        }
    })

    if(sortBy && sortType){
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    }else {
        pipeline.push({
            $sort: {createdAt: -1}
        })
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $project: {
                "ownerDetails.password": 0,
                "ownerDetails.refreshToken": 0
            }
        }
    );

    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 20),
        limit: parseInt(limit, 10)
    };

    const videos = await Video.aggregatePaginate(videoAggregate, options)
    
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async(req, res) => {
    const {title, description} = req.body;

    if(!title || !description){
        throw new ApiError(400, "Title and Description are required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(!videoFileLocalPath){
        throw new ApiError(400, "Video file is missing")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile){
        throw new ApiError(400, "Video upload failed")
    }

    const video = await Video.create({
        title,
        description,
        duration: videoFile.duration, //cloudinary provides this
        videoFile: {
        url: videoFile.url,
        publicId: videoFile.public_id }, 
        thumbnail: {
        url: thumbnail.url,
        publicId: thumbnail.public_id },
        owner: req.user._id,
        public_id: videoFile.public_id,
        isPublished: true
    })

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async(req, res) => {
    const {videoId} = req.params;

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Video id is not valid")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: {views: 1} //ek saath 2 views bhi aaye honge to handle ho jayenge
        },
        {new: true}
    ).populate("owner", "fullName username avatar");// getting owner details

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully with updated views"))

})

const updateVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
    const {title, description} = req.body;
    const thumbnailLocalPath = req.file?.path;

    if(!mongoose.isValidObjectId(videoId)){
        return new ApiError(400, "Invalid Video ID")
    }

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and Description are required");
    }

    const video = await Video.findById(videoId);
    
    if(!video){
        throw new ApiError(400, "Video not found")
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "Unauthorized! You are not the owner of thie video")
    }

    const uploadData = {
        $set: {
            title,
            description
        }
    }

    if(thumbnailLocalPath){
        const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    

        if(!newThumbnail?.url){
            throw new ApiError(400, "Thumbnail upload failed")
        }

        if(video.thumbnail?.publicId){
            await deleteFromCloudinary(video.thumbnail.publicId, "image")
        }

        uploadData.$set.thumbnail = {
            url: newThumbnail.url,
            publicId: newThumbnail.public_id
        }
     
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        uploadData,
        {new: true}
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video details Updated successfully"))
})

const togglePublishStatus = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
   //using normal logic
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    // Owner check
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not the owner! ❌");
    }

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200,video,"Publish status updated")
        );

})


const deleteVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params;

    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const deletedVideo = await Video.findOneAndDelete({
        _id: videoId,
        owner: req.user._id
    });

    if(!deletedVideo){
        throw new ApiError(404, "Video not found or you are not the owner of the video")
    }

    if(deletedVideo.thumbnail?.publicId){
        await deleteFromCloudinary(deletedVideo.thumbnail.publicId, "image");
    }

    if(deletedVideo.videoFile?.publicId){
        await deleteFromCloudinary(deletedVideo.videoFile.publicId, "video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted succcessfully"))
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

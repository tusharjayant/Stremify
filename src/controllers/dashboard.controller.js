import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getChannelStats = asyncHandler(async(req, res) => {
    const userId = req.user._id

    const videoStatsPromise = Video.aggregate([
        {
           $match: {owner: new mongoose.Types.ObjectId(userId)}
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "videos",
                as: "likes"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: {$sum: 1},
                totalViews: {$sum: "$views"},
                totalLikes: {$sum: {$size: "$likes"}}
            }
        }
    ])

    // Separate query to fetch total subscribers for the channel
    // this is also a promise
    const totalSubscribersPromise = Subscription.countDocuments({
        channel: userId
    })
    
    // Run both queries in parallel using Promise.all
    const [videoStats, totalSubscribers] = await Promise.all([videoStatsPromise, totalSubscribersPromise])

    // Prepare the response data
    const stats = {
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: videoStats[0]?.totalLikes || 0,
        totalSubscribers: totalSubscribers || 0
    }

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"))

})

const getChannelVideos = asyncHandler(async(req, res) => {
    const userId = req.user._id
    const {page = 1, limit = 10} = req.query

/*
    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skipAmount = (pageNumber - 1) * limitNumber

//we used pagination (skip and limit) here
    const videos = await Video.find({owner: userId})
                    .sort({createdAt: -1})
                    .select("-description")
                    .skip(skipAmount)
                    .limit(limitNumber)

    const totalVideos = await Video.countDocuments({owner: userId})
    */

    const videoAggregate = Video.aggregate([
        {
            $match: {owner: new mongoose.Types.ObjectId(userId)}
        },
        {
            $sort: {createdAt: -1}
        },
        {
            $project: {description: 0}
        }
    ])

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const paginatedVideos = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, paginatedVideos, "Channel videos fetched successfully"))

})

export {
        getChannelStats,
        getChannelVideos
    }


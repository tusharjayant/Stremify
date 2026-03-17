import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async(req, res) => {
    const {channelId} = req.params;

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid Object ID")
    }

    if(channelId.toString() === req.user._id.toString()){
        throw new ApiError(400, "You can not subscribe yourself")
    }   
/*

    const status = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if(status){
        //if doc. found
        await Subscription.findByIdAndUpdate(status._id);

        return res
            .status(200)
            .json(new ApiResponse(200, {isSubscribed: false}, "Unsubscribed Successfully"))

    }else {
        //if doc. not found
        const newSubscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })

        if(!newSubscription){
            throw new ApiError(500, "Unable to subscribe")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, {isSubscribed: true}, "Subscribed Successfully"))
    }
    */

    const existingSubscription = await Subscription.findOneAndDelete({
        subscriber: req.user._id,
        channel: channelId
    })//if doc. found, it will be deleted and returned in existingSubscription variable 
    
    if(existingSubscription){
        return res
            .status(200)
            .json(new ApiResponse(200, {isSubscribed: false}, "Unsubscribed Successfully"))
    }

    //if doc. not found, then create a new subscription
    const newSubscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })
    
    if(!newSubscription){
        throw new ApiError(500, "Unable to subscribe")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {isSubscribed: true}, "Subscribed Successfully"))
})

const getUserChannelSubscribers = asyncHandler(async(req, res) => {
    const {channelId} = req.params;

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid Object ID")
    }

    const subscribersList = await Subscription.find(
        {channel: channelId}
        ).populate("subscriber", "fullName email avatar")

    if(subscribersList.length === 0){
        //find() will return an empty array if no subscribers are found, so we check for length === 0, it does not return null or undefined, it returns an empty array
    return res
        .status(200)
        .json(new ApiError(404, "No subscribers found for this channel"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscribersList, "Subscribers fetched successfully"))
})

const getSubscribedChannels = asyncHandler(async(req, res) => {
    const {subscriberId} = req.params;

    if(!mongoose.isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid Object ID")
    }
    const subscribedChannels = await Subscription.find({subscriber: subscriberId}).populate("channel", "fullName username avatar")

    if(subscribedChannels.length === 0){
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No subscribed channels found for this user"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}

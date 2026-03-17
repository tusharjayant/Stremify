import mongoose from 'mongoose';
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {Playlist} from '../models/playlist.model.js';

const createPlaylist = asyncHandler(async(req, res) => {
    //retring data from request body
    const {name, description} = req.body;

    if(!name || name.trim() === ""){
        throw new ApiError(400, "Name of the playlist is required")
    }

    const playlist = await Playlist.findOne({
        name: name.trim(),
        owner: req.user._id
    })

    if(playlist){
        throw new ApiError(409, "You already have a playlist with this name. Please choose a different name.")
    }

    const newPLaylist = await Playlist.create({
        name:  name.trim(),
        description : description?.trim() || "",
        owner: req.user._id,
        videos: [] // Initially, the playlist will be empty
    })

    if(!newPLaylist){
        throw new ApiError(500, "Failed to create playlist")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, newPLaylist, "Playlist created successfully"))
})

const addVideoToPlaylist = asyncHandler(async(req, res) => {
    const {playlistId, videoId} = req.params;// we will get playlistId and videoId from the url parameters

    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)){    
        throw new ApiError(400, "Invalid playlistId or videoId")
    }

    // Find the playlist and ensure that the current user is the owner of the playlist before adding the video to it
    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {$addToSet: {videos: videoId}},// $addToSet operator ensures that the videoId is added to the videos array only if it doesn't already exist, preventing duplicates.
        {new: true}
    )

    if(!updatedPlaylist){
        throw new ApiError(404, "Playlist not found or you are not the owner of this playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async(req, res) => {
    const {playlistId, videoId} = req.params;

    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Playlist or Object id")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id// Ensure that the current user is the owner of the playlist before removing the video from it
        },
        {$pull: {videos: videoId}},// $pull operator removes the videoId from the videos array if it exists. If the videoId is not present in the array, it does nothing.
        {new: true}
    )

    if(!updatedPlaylist){
        throw new ApiError(404, "Playlist not found or you are not the owner of this playlist")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, updatedPlaylist, "Video removed successfully from the playlist"))
})

const deletePlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params;

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id")
    }

    const deletedPlaylist = await Playlist.findOneAndDelete(
        {
        _id: playlistId,
        owner: req.user._id
        }
    )

    if(!deletedPlaylist){
        throw new ApiError(404, "Playlist not found or you are not the owner of this playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params;
    const {name, description} = req.body;

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id")
    }

    if(!name || name.trim() === "" || !description || description.trim() === ""){
        throw new ApiError(400, "Name and description of the playlist is required")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $set: {
                name: name.trim(),
                description: description.trim()
            }
        },
        {new: true}
    )

    if(!updatedPlaylist){
        throw new ApiError(404, "Playlist not found or You are not the owner of the playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))

})

const getUserPlaylists = asyncHandler(async(req, res) => {
    const {userId} = req.params;

    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User Id")
    }

    const playlists = await Playlist.find({owner: userId});

    if(!playlists){
        throw new ApiError(404, "No playlist found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlists, "User playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async(req, res) => {
    const {playlistId} = req.params;

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id")
    }

    const playlist = await Playlist.findById(playlistId)
            .populate({
                path: "videos",
                select: "title thumnbail duration views owner",
                populate: {
                    path: "owner",
                    select: "username name avatar"
                }
            })

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

export {
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    getUserPlaylists,
    getPlaylistById
}
import {Router} from 'express';
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvatar, 
    updateCoverImage, 
    getUserChannelProfile, 
    getWatchHistory, 
    updateAccountDetails
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
); 



router.route('/login').post(loginUser) //login route


// secured routes

router.route('/logout').post(verifyJWT, logoutUser)// logout route with a middleware in between to verify user

router.route('/refresh-token').post(refreshAccessToken)//we have given the endpoint for refreshAccessToken, we have not added verifyJWT middleware here bcz here is no need of it we are doing the same work in the controller as well

router.route('/change-password').post(verifyJWT, changeCurrentPassword) // change password route with verifyJWT middleware to check if the user is authenticated or not before allowing them to change their password

router.route('/current-user').get(verifyJWT, getCurrentUser) // get current user details route with verifyJWT middleware to check if the user is authenticated or not before allowing them to access their details

router.route('/update-account').patch(verifyJWT, updateAccountDetails) // update account details route with verifyJWT middleware to check if the user is authenticated or not before allowing them to update their account details


router.route("/avatar").post(verifyJWT, upload.single("avatar"), updateUserAvatar) // update avatar route with verifyJWT middleware to check if the user is authenticated or not before allowing them to update their avatar, and multer middleware to handle the file upload

router.route("/coverImage").post(verifyJWT, upload.single("coverImage"), updateCoverImage) // update cover image route with verifyJWT middleware to check if the user is authenticated or not before allowing them to update their cover image, and multer middleware to handle the file upload

router.route('/c/:username').get(verifyJWT, getUserChannelProfile) // get user channel profile route with verifyJWT middleware to check if the user is authenticated or not before allowing them to access the channel profile


router.route('/history').get(verifyJWT, getWatchHistory) // get watch history route with verifyJWT middleware to check if the user is authenticated or not before allowing them to access their watch history




export default router;

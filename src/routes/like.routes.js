import {Router} from 'express';
import {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getLikedVideos
    } from '../controllers/like.controller.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT); //all routes after this middleware will be protected

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);


export default router;

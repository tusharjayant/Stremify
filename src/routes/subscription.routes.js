import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route('/c/:channelId')
        .post(toggleSubscription)//toggle subscription status of a channel for the logged in user
        .get(getUserChannelSubscribers)//get all subscribers of a channel

router.route('/u/:subscriberId')
        .get(getSubscribedChannels)//get all channels that a user is subscribed to

export default router;
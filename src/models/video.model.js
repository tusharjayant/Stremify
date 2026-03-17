import mongoose, {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const videoSchema = new mongoose.Schema(
    {
        videoFile:{
            url: {
                type: String, // Cloudinary URL
                required: true
            },
            publicId: {
                type: String, // Cloudinary Public ID (Safaai ke liye kaam aata h)
                required: true
            }
        },
        thumbnail: {
          //  type: String, //cloudinary url
           // required: true,
           url: {
                type: String, 
                required: true
            },
            publicId: {
                type: String, 
                required: true
            }
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number, //cloudinary url
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },

    }, {timestamps: true})


videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', videoSchema); 
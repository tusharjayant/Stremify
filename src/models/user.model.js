
import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const userSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
         email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
        },
         fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true,
        },
         avatar: {
            type: String, // we'll use cloudinary url
            required: true,
         },
         coverImage: {
            type: String, // we'll use cloudinary url
         },
         watchHistory: {
            type: Schema.Types.ObjectId,
            ref: 'Video',
         },
         password: {
            type: String,
            required: [true, 'Password is required'],
            /*Structure Breakdown:
                Key: type: String (Password text format mein hoga).

                Validation: required: [true, 'ErrorMessage'].
                */
         },
         refreshToken: {
            type: String,
         },

    },{timestamps: true}
)

// pre save hook for password hashing


userSchema.pre("save", async function () {
    if(!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
     //password hashing with salt rounds 10
}) // its the pre hook method of mongoose which runs before saving the user


userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}// bcrypt.compare method compares the plain text password with the hashed password stored in the database. It returns true if they match, otherwise false.


userSchema.methods.generateAccessToken = function () {
    return jwt.sign( // return lgana bhul gya tha
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRY,
        }
    )
}// generateAccesssToken method creates a JWT access token that contains user details like _id, email, username, and fullName. This token is signed with a secret key and has a short expiration time. 

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(// return lgana bhul gya tha 
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_SECRET_EXPIRY,
        }
    )
} // generateRefreshToken method creates a JWT refresh token that contains only the user's _id. This token is signed with a secret key and has a longer expiration time compared to the access token.

export const User = mongoose.model('User', userSchema);

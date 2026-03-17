import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localFilePath) => {
    try{
        if (!localFilePath) return null;

        // upload file on cloudinary
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" //file type auto detect kar lega
        })

        // file has been uploaded successfully
       // console.log('File has been successfully uploaded', response.url);


       fs.unlinkSync(localFilePath)// delete the file from local server if uploaded on cloudinary or upload fails

        return response; // response me pura object aata  h usme se hum erl le lete h
        
    }catch(error){
        fs.unlinkSync(localFilePath); // delete the file from local server if uploaded on cloudinary or upload fails

        console.error('Error while uploading file on cloudinary', error);
        return null;
    }
}

const deleteFromCloudinary = async(publicId, resourceType = "image") => {
    try{
        if(!publicId) return null;
        
        const response = cloudinary.uploader.destroy(publicId, {
            resource_Type: resourceType
        })

        return response;

    }catch(error){
        console.error("Cloudinary delete error:", error);
        return null;
    }

}

export { uploadOnCloudinary, deleteFromCloudinary};


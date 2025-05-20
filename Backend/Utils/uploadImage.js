import { v2 as cloudinary } from 'cloudinary';

// Configure with environment variables
cloudinary.config({
  cloud_name: "doczqznfj",
  api_key: 653986957328288,
  api_secret:"YAS8Mq-iEY_0OegAdfOWacCLn68",
});

export default async function uploadImageCloudinary(buffer) {
  try {
    // Convert buffer to base64 string
    const base64String = buffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64String}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: "auto",
      folder: "user_uploads",
      quality: "auto:good" // Optimize image quality
    });

    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}
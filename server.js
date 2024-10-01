import app from "./app.js";
import databaseConnection from "./config/databaseConfig.js";
import cloudinary from 'cloudinary'

const PORT = process.env.PORT || 5002;

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

app.listen(PORT, async () => {
    await databaseConnection();
    console.log(`Server is running smoothly at http://localhost:${PORT}`);
})

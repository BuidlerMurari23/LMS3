import multer from 'multer';
import path from 'path';
import AppError from '../utils/errorUtils.js';

const upload = multer({
    dest: "uploads/",
    maxLimit: 50 * 1024 * 1024, // 50 MB of max image can be uploaded
    storage: multer.diskStorage({
        destination: "uploads/",
        filename: (_req, file, cb) => {
            cb(null, file.originalname)
        }
    }),
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname);

        if (
            ext !== ".jpg" &&
            ext !== ".jpeg" &&
            ext !== ".webp" &&
            ext !== ".png" &&
            ext !== ".mp4"
        ){
            return cb( new AppError(`Unsupported file type ${ext}`, 502))
        }

        cb(null, true)
    } 
});

export default upload;
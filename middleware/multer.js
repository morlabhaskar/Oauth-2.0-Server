import multer from 'multer';

const storage = multer.memoryStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use original file name
    },
}); // Store files in memory

const upload = multer({ storage }); 

export default upload;


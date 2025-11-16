import multer from "multer";

const storage = multer.memoryStorage(); // store in memory for cloudinary
const upload = multer({ storage });

export default upload;

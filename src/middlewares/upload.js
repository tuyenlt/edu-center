const multer = require('multer');
const path = require('path');

// const avatarStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/avatars/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, req.user.id + path.extname(file.originalname));
//     },
// });

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
    }
});

module.exports = upload

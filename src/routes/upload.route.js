const router = require('express').Router();
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure the directory exists
const avatarDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}

router.post('/upload/avatar', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const croppedImage = await sharp(req.file.buffer)
            .resize(300, 300, {
                fit: 'cover',
                position: 'center',
            })
            .toFile(path.join(avatarDir, `${req.user._id}.jpg`)).catch(err => {
                console.error('Error processing image:', err);
                throw err;
            }).finally(() => {
                // Clean up the buffer
                req.file.buffer = null;
                console.log('Buffer cleaned up');
            })
        res.status(200).json({
            message: 'File uploaded and cropped successfully',
            file: croppedImage,
            url: `${process.env.APP_URL}/uploads/avatars/${req.user._id}.jpg`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'File upload failed',
            error: error.message,
        });
    }
});


router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const timestamp = Date.now();
        const extension = path.extname(req.file.originalname);
        const filename = `${timestamp}${extension}`;

        const filePath = path.join(__dirname, '../../uploads/images', filename);

        fs.writeFileSync(filePath, req.file.buffer);

        res.status(200).json({
            message: 'File uploaded successfully',
            url: `${process.env.APP_URL}/uploads/images/${filename}`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'File upload failed',
            error: error.message,
        });
    }
});



module.exports = router;

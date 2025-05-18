const router = require('express').Router();
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');
const uploadService = require('../services/upload.service');

router.post('/upload/avatar', auth, upload.single('image'), uploadService.uploadAvatar);
router.post('/upload', upload.single('image'), uploadService.uploadSingleImage);


module.exports = router;

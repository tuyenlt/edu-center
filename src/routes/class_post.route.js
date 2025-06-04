const classPostController = require('../controllers/class_post.controller');
const express = require('express');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post("/class-posts", auth, classPostController.createClassPost);
router.delete("/class-posts/:id", classPostController.deleteClassPost);

module.exports = router;

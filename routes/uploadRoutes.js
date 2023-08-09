const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfileImage, uploadCommonFiles } = require('../config/multerConfig');
const router = express.Router();
const {
    uploadFiles,
    uploadProfileImg,
    getMyProfilePic
} = require('../controllers/uploadController');

router.post('/uploadFiles', protect, uploadCommonFiles.array('file'), uploadFiles)
router.post('/uploadProfileImg', protect, uploadProfileImage.single('file'), uploadProfileImg)
router.get('/getMyProfilePic', protect, getMyProfilePic)



module.exports = router;



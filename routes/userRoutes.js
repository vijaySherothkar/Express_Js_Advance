const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    verifyOTP,
    resendRegistrationOTP,
    forgotPassword,
    updatePassword,
    uploadFiles
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/verifyOTP', verifyOTP);
router.post('/resendRegistrationOTP', resendRegistrationOTP);
router.post('/forgotPassword', forgotPassword);
router.post('/updatePassword', updatePassword);
router.post('/login', loginUser);
router.get('/getMe', protect, getMe);

module.exports = router;

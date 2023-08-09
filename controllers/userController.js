const expressAsyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/userModel');
const nodemailer = require('nodemailer');

// Email transport configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vijay@rejola.com',
        pass: 'xcsqluhvgcetftrb'
    }
});

// Generate a 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

// Generate an expiry timestamp (e.g., 10 minutes from now)
const generateExpiryTime = () => {
    const now = new Date();
    return new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
};
// -------------------------------------------------------------------------Registration Start ------------------------------------

const registerUser = expressAsyncHandler(async (req, res) => {
    const { name, email, password, phoneNumber, userType } = req.body;
    // console.log("Register", req.body)
    if (!email || !name || !password || !phoneNumber || !userType) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const userExists = await User.findOne({ email });
    // console.log("Clog")
    // console.log(userExists)
    if (userExists && userExists.isVerified) {
        res.status(400);
        throw new Error('User already exists');
    } else {

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ---------- OTP SENDING PROCESS-------
        try {

            // Generate a 6-digit verification code and expiry time
            const verificationCode = generateVerificationCode();
            const expiryTime = generateExpiryTime();
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                // User already exists, update the user's data
                existingUser.name = name;
                existingUser.password = hashedPassword;
                existingUser.phoneNumber = phoneNumber;
                existingUser.userType = userType;
                existingUser.isVerified = false; // Set to false if you want to re-verify the user after updates
                existingUser.verificationCode = verificationCode;
                existingUser.verificationCodeExpiry = expiryTime;
                // ... (update any other properties as needed)

                await existingUser.save();
            } else {
                // create user details in the database 
                const user = new User({
                    name,
                    email,
                    phoneNumber,
                    password: hashedPassword,
                    userType,
                    verificationCode,
                    verificationCodeExpiry: expiryTime,
                    isVerified: false,
                });

                await user.save();
            }
            // Send verification email with the verification code
            const mailOptions = {
                from: 'vijay@rejola.com',
                to: email,
                subject: 'Email Verification',
                text: `Hello ${name}, Your verification code is: ${verificationCode}`,
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({ message: 'Registration successful. Please check your email for verification code.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'An error occurred during registration.' });
        }
    }
});
// ----------Resen OTP------
const resendRegistrationOTP = expressAsyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user by email
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Generate a new verification code and expiry time
        const verificationCode = generateVerificationCode();
        const expiryTime = generateExpiryTime();

        // Update the user's data with the new OTP
        existingUser.verificationCode = verificationCode;
        existingUser.verificationCodeExpiry = expiryTime;
        existingUser.isVerified = false;

        await existingUser.save();

        // Send the new verification email with the new verification code
        const mailOptions = {
            from: 'vijay@rejola.com',
            to: email,
            subject: 'Email Verification',
            text: `Hello ${existingUser.name}, Your new verification code is: ${verificationCode}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'New OTP sent. Please check your email for the new verification code.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while resending OTP.' });
    }
});

// ---------- OTP SENDING PROCESS END-------
// Email verification endpoint
const verifyOTP = expressAsyncHandler(async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        // Find user by email and verification code
        const user = await User.findOne({ email, verificationCode });
        // console.log('Request body:', req.body);

        if (!user) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        // Check if verification code is still valid (not expired)
        if (user.verificationCodeExpiry <= new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }

        // Mark the user account as verified
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verification successful. You can now log in.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred during email verification (user controller).' });
    }
});
// Email verification end
// -------------------------------------------------------------------------Registration End -------------------------------
// -------------------------------------------------------------------------Login  Start------------------------------------
const loginUser = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // console.log("Login API", user)
    if (user.isVerified) {
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                userId: user.id, //note:  "user._id" or "user.id" both are same on monogo db both will refer to _id only
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                userType: user.userType,
                token: generateJWT(user.id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid credentials');
        }
    } else {
        res.status(400);
        throw new Error('Please register this account');
    }
});
// -------------------------------------------------------------------------Login End------------------------------------
// -------------------------------------------------------------------------Forgot Password Send OTP  Start-----------------------
const forgotPassword = expressAsyncHandler(async (req, res) => {
    const { email } = req.body;
    try {
        // Find the user by email
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Generate a new verification code and expiry time
        const verificationCode = generateVerificationCode();
        const expiryTime = generateExpiryTime();

        // Update the user's data with the new OTP
        existingUser.verificationCode = verificationCode;
        existingUser.verificationCodeExpiry = expiryTime;

        await existingUser.save();

        // Send the new verification email with the new verification code
        const mailOptions = {
            from: 'vijay@rejola.com',
            to: email,
            subject: 'Forget Password Email Verification',
            text: `Hello ${existingUser.name}, Your new verification code is: ${verificationCode}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'New OTP sent. Please check your email for the new verification code.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while resending OTP.' });
    }
});
// -------------------------------------------------------------------------Forgot Password Send OTP Ends  End-----------------------
// -------------------------------------------------------------------------Update Password Verify OTP Start-----------------------
const updatePassword = expressAsyncHandler(async (req, res) => {
    try {
        const { email, verificationCode, newPassword } = req.body;

        // Find user by email and verification code
        const user = await User.findOne({ email, verificationCode });
        // console.log('Request body:', req.body);

        if (!user) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        // Check if verification code is still valid (not expired)
        if (user.verificationCodeExpiry <= new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Mark the user account as verified
        user.password = hashedPassword
        user.verificationCode = undefined;
        user.verificationCodeExpiry = undefined;

        await user.save();

        res.status(200).json({ message: 'Password Updated successful. You can now log in.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred during email verification .' });
    }
});

// -------------------------------------------------------------------------Update Password Verify OTP  End-----------------------




const getMe = expressAsyncHandler(async (req, res) => {
    res.status(200).json({ message: req.user });//test api
});

const generateJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    verifyOTP,
    resendRegistrationOTP,
    getMe,
    forgotPassword,
    updatePassword,

};

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log("decoded", decoded)
            req.user = await User.findById(decoded.id).select('-password');
            // console.log("middleware AUTH", req.user)
            if (req.user) {
                next();
            } else {
                res.status(400);
                throw new Error('User details not found!');
            }
        } catch (error) {
            console.log(error);
            res.status(401);
            if (token) {
                throw new Error('Invalid Token');
            } else {
                throw new Error('Not authorized!');
            }

        }
    }

    if (!token) {
        res.status(401);
        throw new Error('not authorized, no token passed');
    }
});

module.exports = {
    protect,
};


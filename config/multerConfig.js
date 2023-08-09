const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Storage configuration using Multer

// ---Storage for profile images--------
const storageForProfilePics = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.user.id;
        const uploadDir = path.join('./uploads/profileImages', userId); // Specify the directory where files will be stored
        // Create the user's directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Replace spaces with hyphens in the original filename
        const originalname = file.originalname.replace(/\s+/g, '-');
        cb(null, originalname); // File naming:   originalname
    }
});
// --------Storage for common files----
const storageForCommonFiles = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.user.id; // Assuming you have access to the user ID
        // console.log("multerConfig Files", userId)
        const userUploadDir = path.join('./uploads/commonFiles', userId);

        // Create the user's directory if it doesn't exist
        if (!fs.existsSync(userUploadDir)) {
            fs.mkdirSync(userUploadDir, { recursive: true });
        }

        cb(null, userUploadDir);
    },
    filename: function (req, file, cb) {
        const date = new Date(); // Replace with your actual date
        const day = date.getDate().toString().padStart(2, '0'); // Pad with '0' if single digit
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        const formattedTodayDate = `${day}-${month}-${year}`;
        const originalname = file.originalname.replace(/\s+/g, '-');
        cb(null, formattedTodayDate + originalname); // Use the original filename
    }
});

// Export the Multer middleware
const uploadProfileImage = multer({ storage: storageForProfilePics });
const uploadCommonFiles = multer({ storage: storageForCommonFiles });


module.exports = { uploadProfileImage, uploadCommonFiles };

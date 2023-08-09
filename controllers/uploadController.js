const expressAsyncHandler = require("express-async-handler");
const User = require('../model/userModel');
const path = require('path');
const fs = require('fs');

const uploadFiles = expressAsyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    const userId = req.user.id; // Assuming you have access to the user ID

    let uploadedFileUrls = [];

    for (const file of req.files) {
        const userUploadDir = path.join('./uploads/commonFiles', userId);
        const uploadedFilePath = path.join(userUploadDir, file.filename);

        // Check if the file with the same name already exists
        if (fs.existsSync(uploadedFilePath)) {
            // If the new filename is different, remove the existing file
            if (file.filename !== path.basename(uploadedFilePath)) {
                fs.unlinkSync(uploadedFilePath);
            }
        }

        // Move the new uploaded file to the user's directory
        fs.renameSync(file.path, uploadedFilePath);

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/commonFiles/${userId}/${file.filename}`;
        uploadedFileUrls.push(fileUrl);
    }

    res.status(200).json({ message: 'Files uploaded successfully.', fileUrls: uploadedFileUrls });
});

// -------------upload profile img-------------------------------------------------------------
const uploadProfileImg = expressAsyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No Image uploaded.');
    }
    const userId = req.user.id;

    // Save the file details (e.g., filename) in the user's profile in the database
    // Update the user's profile with the filename or the image URL
    // (Replace 'profileImage' with the property in your database where the filename/URL is saved)
    try {
        let filePath;
        const imageRootPath = path.resolve(__dirname, '..', 'uploads', 'profileImages', userId);
        if (req.file.filename) {
            filePath = path.join(imageRootPath, req.file.filename);

        }
        const prfImg = await User.findByIdAndUpdate(userId, { profileImage: filePath }, { new: true });

        if (!prfImg) {
            // If the user with the provided userId is not found, handle the error
            return res.status(404).json({ error: 'User not found.' });
        }

        // Return the URL to the client
        res.status(200).json({ message: 'Profile image uploaded successfully.', filename: filePath });
    } catch (error) {
        console.error(error);
        // Handle other potential errors (e.g., database error, network issue, etc.)
        res.status(500).json({ error: 'Something went wrong.' });
    }

});
// -----------------additional api not at all required 
const getMyProfilePic = expressAsyncHandler(async (req, res) => {
    const userId = req.user.id;
    try {
        // Retrieve the user from the database based on the user ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Retrieve the filename or URL of the profile image from the user object
        const profileImageFilename = user.profileImage;
        // Assuming imageRootPath is one level above the current directory
        const imageRootPath = path.resolve(__dirname, '..', 'uploads', 'profileImages');

        // Assuming fileName is the name of the uploaded file
        const filePath = path.join(imageRootPath, profileImageFilename);

        // res.status(200).sendFile(filePath);
        res.status(200).json({ filePath });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error retrieving user profile.' });
    }
});

module.exports = {
    uploadProfileImg,
    uploadFiles,
    getMyProfilePic
};

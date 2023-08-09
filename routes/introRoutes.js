const express = require('express');
const router = express.Router();

const { getGoals, setGoals, updateGoals, deleteGoals } = require("../controllers/goalsController");
const { protect } = require('../middleware/authMiddleware');
// Define your routes
router.get('/', protect, getGoals);
router.post('/setGoals', protect, setGoals);
router.put('/updateGoals/:id', protect, updateGoals);
router.delete('/deleteGoals/:id', protect, deleteGoals);
router.get('/profile/:id', (req, res) => {
    // Handle the GET request for the 'profile' route with a parameter ('/profile/:id')
    const userId = req.params.id;
    // You can use the 'userId' to retrieve user information from the database, for example
    res.send(`User profile for user with ID: ${userId}`);
});

// Export the router to make it available to other files
module.exports = router;

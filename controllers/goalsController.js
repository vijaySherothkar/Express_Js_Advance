const expressAsyncHandler = require("express-async-handler");
const Goal = require("../model/goalModal")

const User = require('../model/userModal');

// Define the controller function for user registration
const getGoals = expressAsyncHandler(async (req, res) => {
    const goals = await Goal.find({ user: req.user.id });
    res.status(200).json(goals);
});

const setGoals = expressAsyncHandler(async (req, res) => {
    if (!req.body.text) {
        res.status(400);
        throw new Error("Empty name field error");
    } else {
        const goals = await Goal.create({
            text: req.body.text,
            user: req.user.id,
        });
        res.status(200).json(goals);
    }
});
const updateGoals = expressAsyncHandler(async (req, res) => {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
        res.status(400);
        throw new Error('Goal not found');
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }

    if (goal.user.toString() !== user.id) {
        res.status(401);
        throw new Error('User not authorised');
    }

    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedGoal);

});
const deleteGoals = expressAsyncHandler(async (req, res) => {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
        res.status(400);
        throw new Error('Goal not found');
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }

    if (goal.user.toString() !== user.id) {
        res.status(401);
        throw new Error('User not authorised');
    }

    await goal.deleteOne();

    res.status(200).json({ id: req.params.id });
});
module.exports = {
    getGoals,
    setGoals,
    updateGoals,
    deleteGoals
};

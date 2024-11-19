const express = require('express');
const router = express.Router();
const TaskList = require('../models/TaskList');

// Get all task lists
router.get('/', async (req, res) => {
    try {
        const taskLists = await TaskList.find().sort({ createdAt: -1 });
        res.json(taskLists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create task list
router.post('/', async (req, res) => {
    try {
        const taskList = new TaskList({
            title: req.body.title,
            tasks: []
        });
        const newTaskList = await taskList.save();
        res.status(201).json(newTaskList);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add task to list
router.post('/:id/tasks', async (req, res) => {
    try {
        const taskList = await TaskList.findById(req.params.id);
        if (!taskList) {
            return res.status(404).json({ message: 'Task list not found' });
        }

        taskList.tasks.push({
            title: req.body.title,
            status: 'NOT_STARTED',
            dueDate: req.body.dueDate,
            dueTime: req.body.dueTime
        });

        const updatedTaskList = await taskList.save();
        res.status(201).json(updatedTaskList);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
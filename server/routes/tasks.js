const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

// הצגת כל המשימות
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching tasks for user:', req.user.userId);
        const tasks = await Task.find({ userId: req.user.userId })
            .populate('userId', 'name email')
            .populate('sharedWith.userId', 'name email');

        console.log('Found tasks:', tasks.length);
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ message: 'שגיאה בטעינת המשימות', error: err.message });
    }
});

// הצגת משימות משותפות
router.get('/shared-with-me', auth, async (req, res) => {
    try {
        console.log('Fetching shared tasks for user:', req.user.userId);
        const tasks = await Task.find({
            'sharedWith.userId': req.user.userId
        })
            .populate('userId', 'name email')
            .populate('sharedWith.userId', 'name email');

        console.log('Found shared tasks:', tasks.length);
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching shared tasks:', err);
        res.status(500).json({ message: 'שגיאה בטעינת המשימות המשותפות', error: err.message });
    }
});

// יצירת משימה חדשה
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating new task:', req.body);
        const task = new Task({
            ...req.body,
            userId: req.user.userId
        });

        const savedTask = await task.save();
        console.log('Task created:', savedTask._id);

        // לאחר השמירה, מחזיר את המשימה עם כל הפרטים המלאים
        const populatedTask = await Task.findById(savedTask._id)
            .populate('userId', 'name email')
            .populate('sharedWith.userId', 'name email');

        res.status(201).json(populatedTask);
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({
            message: 'שגיאה בהוספת משימה',
            error: err.message,
            validationErrors: err.errors
        });
    }
});

// עדכון משימה
router.patch('/:taskId', auth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.taskId,
            $or: [
                { userId: req.user.userId },
                { 'sharedWith.userId': req.user.userId, 'sharedWith.permission': { $in: ['EDIT', 'ADMIN'] } }
            ]
        });

        if (!task) {
            return res.status(404).json({ message: 'משימה לא נמצאה או אין הרשאות מתאימות' });
        }

        Object.assign(task, req.body);
        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate('userId', 'name email')
            .populate('sharedWith.userId', 'name email');

        res.json(updatedTask);
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ message: 'שגיאה בעדכון המשימה', error: err.message });
    }
});

// מחיקת משימה
router.delete('/:taskId', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.taskId,
            userId: req.user.userId
        });

        if (!task) {
            return res.status(404).json({ message: 'משימה לא נמצאה או אין הרשאות מתאימות' });
        }

        res.json({ message: 'המשימה נמחקה בהצלחה' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ message: 'שגיאה במחיקת המשימה', error: err.message });
    }
});

router.post('/:taskId/share', auth, async (req, res) => {
    try {
        console.log('Share request received:', {
            taskId: req.params.taskId,
            body: req.body,
            userId: req.user.userId
        });

        const { users, permission } = req.body;
        const taskId = req.params.taskId;

        // בדיקה שהמשימה קיימת ושייכת למשתמש
        const task = await Task.findOne({
            _id: taskId,
            $or: [
                { userId: req.user.userId },
                { 'sharedWith.userId': req.user.userId, 'sharedWith.permission': 'ADMIN' }
            ]
        });

        if (!task) {
            console.log('Task not found or user not authorized');
            return res.status(404).json({ message: 'משימה לא נמצאה או אין הרשאות מתאימות' });
        }

        // מצא את המשתמשים לפי אימייל
        const usersToShare = await User.find({
            email: { $in: users }
        });

        console.log('Found users to share with:', usersToShare);

        if (usersToShare.length === 0) {
            return res.status(404).json({ message: 'לא נמצאו משתמשים לשיתוף' });
        }

        // מסנן כפילויות ומוסיף משתמשים חדשים
        const existingUserIds = task.sharedWith.map(share => share.userId.toString());
        const newSharedUsers = usersToShare
            .filter(user => !existingUserIds.includes(user._id.toString()))
            .map(user => ({
                userId: user._id,
                permission: permission || 'VIEW'
            }));

        console.log('New shared users:', newSharedUsers);

        if (newSharedUsers.length === 0) {
            return res.status(400).json({ message: 'המשתמשים שציינת כבר משותפים במשימה זו' });
        }

        task.sharedWith.push(...newSharedUsers);
        await task.save();

        // החזרת המשימה המעודכנת עם פרטי המשתמשים
        const updatedTask = await Task.findById(taskId)
            .populate('userId', 'name email')
            .populate('sharedWith.userId', 'name email');

        console.log('Task updated successfully');
        res.json(updatedTask);
    } catch (err) {
        console.error('Error in share task:', err);
        res.status(500).json({
            message: 'שגיאה בשיתוף המשימה',
            error: err.message
        });
    }
});

// עדכון הרשאות שיתוף
router.patch('/:taskId/share/:userId', auth, async (req, res) => {
    try {
        const { permission } = req.body;
        const { taskId, userId } = req.params;

        const task = await Task.findOne({
            _id: taskId,
            $or: [
                { userId: req.user.userId },
                { 'sharedWith.userId': req.user.userId, 'sharedWith.permission': 'ADMIN' }
            ]
        });

        if (!task) {
            return res.status(404).json({ message: 'משימה לא נמצאה או אין הרשאות מתאימות' });
        }

        const shareIndex = task.sharedWith.findIndex(
            share => share.userId.toString() === userId
        );

        if (shareIndex === -1) {
            return res.status(404).json({ message: 'משתמש לא נמצא ברשימת השיתוף' });
        }

        task.sharedWith[shareIndex].permission = permission;
        await task.save();

        const updatedTask = await Task.findById(taskId)
            .populate('userId', 'name email')
            .populate('sharedWith.userId', 'name email');

        res.json(updatedTask);
    } catch (err) {
        console.error('Error updating share permissions:', err);
        res.status(500).json({ message: 'שגיאה בעדכון הרשאות', error: err.message });
    }
});

// הסרת שיתוף
router.delete('/:taskId/share/:userId', auth, async (req, res) => {
    try {
        const { taskId, userId } = req.params;

        const task = await Task.findOne({
            _id: taskId,
            $or: [
                { userId: req.user.userId },
                { 'sharedWith.userId': req.user.userId, 'sharedWith.permission': 'ADMIN' }
            ]
        });

        if (!task) {
            return res.status(404).json({ message: 'משימה לא נמצאה או אין הרשאות מתאימות' });
        }

        task.sharedWith = task.sharedWith.filter(
            share => share.userId.toString() !== userId
        );

        await task.save();

        const updatedTask = await Task.findById(taskId)
            .populate('userId', 'name email')
            .populate('sharedWith.userId', 'name email');

        res.json(updatedTask);
    } catch (err) {
        console.error('Error removing share:', err);
        res.status(500).json({ message: 'שגיאה בהסרת השיתוף', error: err.message });
    }
});

module.exports = router;
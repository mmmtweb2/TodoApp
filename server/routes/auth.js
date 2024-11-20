// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const Task = require('../models/Task');
// הרשמה
// routes/auth.js - וודא שיש לך את כל הפונקציות האלה
router.post('/register', async (req, res) => {
    try {
        console.log('Register request:', req.body);
        const { name, email, password } = req.body;

        // בדיקה אם המשתמש קיים
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'משתמש עם אימייל זה כבר קיים' });
        }

        // יצירת משתמש חדש
        user = new User({
            name,
            email,
            password
        });

        await user.save();
        console.log('User saved:', user._id);

        // יצירת טוקן
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'שגיאה בתהליך ההרשמה', error: err.message });
    }
});

// התחברות 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // בדיקת משתמש
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'פרטי התחברות שגויים' });
        }

        // בדיקת סיסמה
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'פרטי התחברות שגויים' });
        }

        // יצירת טוקן
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'שגיאה בשרת' });
    }
});

// קבלת פרטי המשתמש הנוכחי
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'שגיאה בשרת' });
    }
});

// חיפוש משתמשים (לצורך שיתוף)
router.get('/users/search', auth, async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({
                message: 'נא להזין לפחות 2 תווים לחיפוש'
            });
        }

        // חיפוש משתמשים לפי אימייל או שם
        const users = await User.find({
            $or: [
                { email: new RegExp(query, 'i') },
                { name: new RegExp(query, 'i') }
            ],
            _id: { $ne: req.user.userId } // לא להחזיר את המשתמש הנוכחי
        })
            .select('name email')
            .limit(10);

        // החזרת תוצאות מוגבלות למידע הנדרש בלבד
        const safeUsers = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email
        }));

        res.json(safeUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'שגיאה בחיפוש משתמשים' });
    }
});

// בדיקת הרשאות על משימה
router.get('/check-permission/:taskId', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: 'משימה לא נמצאה' });
        }

        const permissions = {
            canEdit: task.canUserEdit(req.user.userId),
            canShare: task.canUserShare(req.user.userId),
            isOwner: task.userId.equals(req.user.userId)
        };

        res.json(permissions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'שגיאה בבדיקת הרשאות' });
    }
});

module.exports = router;
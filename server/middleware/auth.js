// middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = {
    auth: async function (req, res, next) {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ message: 'אין הרשאת גישה' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // שליפת פרטי המשתמש המלאים
            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                return res.status(401).json({ message: 'משתמש לא נמצא' });
            }

            // הוספת פרטי המשתמש המלאים לאובייקט הבקשה
            req.user = {
                userId: user._id,
                name: user.name,
                email: user.email
            };

            next();
        } catch (err) {
            res.status(401).json({ message: 'טוקן לא תקין' });
        }
    }
};
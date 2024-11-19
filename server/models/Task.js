// Task.js

const mongoose = require('mongoose');

// הגדרת סכמת תת-משימות
const subTaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

// עדכון סכמת משתמשים משותפים
const sharedUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    permission: {
        type: String,
        enum: ['VIEW', 'EDIT', 'ADMIN'],
        default: 'VIEW'
    },
    sharedAt: {
        type: Date,
        default: Date.now
    }
});

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    status: {
        type: String,
        enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
        default: 'NOT_STARTED'
    },
    priority: {
        type: String,
        enum: ['HIGH', 'MEDIUM', 'LOW'],
        default: 'MEDIUM'
    },
    category: {
        type: String,
        enum: ['PERSONAL', 'WORK', 'SHOPPING', 'HEALTH', 'OTHER'],
        default: 'OTHER'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedWith: [sharedUserSchema],
    isPublic: {
        type: Boolean,
        default: false
    },
    subTasks: [subTaskSchema]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// מתודות עזר לבדיקת הרשאות
taskSchema.methods.canUserEdit = function (userId) {
    if (this.userId.equals(userId)) return true;
    const userShare = this.sharedWith.find(share =>
        share.userId.equals(userId) &&
        ['EDIT', 'ADMIN'].includes(share.permission)
    );
    return !!userShare;
};

taskSchema.methods.canUserShare = function (userId) {
    if (this.userId.equals(userId)) return true;
    const userShare = this.sharedWith.find(share =>
        share.userId.equals(userId) &&
        share.permission === 'ADMIN'
    );
    return !!userShare;
};

// אינדקסים לביצועים
taskSchema.index({ userId: 1 });
taskSchema.index({ 'sharedWith.userId': 1 });

// וירטואלים
taskSchema.virtual('isShared').get(function () {
    return this.sharedWith.length > 0;
});

module.exports = mongoose.model('Task', taskSchema);
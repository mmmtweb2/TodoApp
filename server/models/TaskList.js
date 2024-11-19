const mongoose = require('mongoose');

const taskListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    tasks: [{
        title: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
            default: 'NOT_STARTED'
        },
        dueDate: Date,
        dueTime: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('TaskList', taskListSchema);
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    //when clear collection use entityName and anything else use name
    name: {
        type: String, // e.g., 'category', 'jobs', etc.
        required: true,
        unique: true,
    },
    value: {
        type: Number,
        required: true,
        default: 0,
    },
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;

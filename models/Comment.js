const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        default: null
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

const Comment = mongoose.model('comments', CommentSchema);
module.exports = Comment;
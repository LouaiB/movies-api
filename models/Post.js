const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    mediapath: {
        type: String,
        default: null
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model('posts', PostSchema);
module.exports = Post;
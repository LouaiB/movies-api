const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: {
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

const Tag = mongoose.model('tags', TagSchema);
module.exports = Tag;
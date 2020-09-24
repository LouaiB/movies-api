const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    alternativeTitles: {
        type: [],
        default: []
    },
    description: {
        type: String,
        required: true
    },
    mediapath: {
        type: String,
        default: null
    },
    thumbnail: {
        type: String,
        default: null
    },
    likes: {
        type: [],
        default: []
    },
    dislikes: {
        type: [],
        default: []
    },
    comments: {
        type: [],
        default: []
    },
    tags: {
        type: [],
        default: []
    },
    views: {
        type: Number,
        default: 0
    },
    createdOn: {
        type: Date,
        default: () => Date.now()
    },
    releasedOn: {
        type: Date,
        default: () => Date.now()
    }
});

const Movie = mongoose.model('movies', MovieSchema);
module.exports = Movie;